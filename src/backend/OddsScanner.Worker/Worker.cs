using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using OddsScanner.Application.Interfaces;
using OddsScanner.Domain.Entities;
using OddsScanner.Domain.Interfaces;
using OddsScanner.Worker.ExternalModels;

namespace OddsScanner.Worker;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly OddsApiClient _apiClient;

    public Worker(
        ILogger<Worker> logger,
        IServiceProvider serviceProvider,
        OddsApiClient apiClient)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _apiClient = apiClient;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var interval = TimeSpan.FromMinutes(30);

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("🌍 Buscando dados reais da The-Odds-Api...");

            try
            {
                var allExternalMatches = await _apiClient.GetUpcomingMatchesAsync();

                if (!allExternalMatches.Any())
                {
                    _logger.LogWarning("Nenhum jogo retornado pela The Odds API.");
                    await Task.Delay(interval, stoppingToken);
                    continue;
                }

                var externalMatches = allExternalMatches
                    .GroupBy(m => new { m.HomeTeam, m.AwayTeam, Date = m.CommenceTime.Date })
                    .Select(g => g.OrderByDescending(x => x.CommenceTime).First())
                    .ToList();

                _logger.LogInformation($"Encontrados {externalMatches.Count} jogos únicos.");

                using var scope = _serviceProvider.CreateScope();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var cacheService = scope.ServiceProvider.GetRequiredService<ICacheService>();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                var dbMatches = await unitOfWork.Matches.GetAllWithOddsAndBookmakersAsync();
                var bookmakerCache = new Dictionary<string, Bookmaker>(StringComparer.OrdinalIgnoreCase);

                foreach (var extMatch in externalMatches)
                {
                    var existingMatch = dbMatches.FirstOrDefault(m =>
                        string.Equals(m.HomeTeam, extMatch.HomeTeam, StringComparison.OrdinalIgnoreCase) &&
                        string.Equals(m.AwayTeam, extMatch.AwayTeam, StringComparison.OrdinalIgnoreCase));

                    Match matchEntity = existingMatch ?? new Match(
                        homeTeam: extMatch.HomeTeam,
                        awayTeam: extMatch.AwayTeam,
                        startTime: extMatch.CommenceTime.ToUniversalTime(),
                        league: "Brasileirão Série A"
                    );

                    if (existingMatch == null)
                    {
                        await unitOfWork.Matches.AddAsync(matchEntity);
                        _logger.LogInformation($"➕ Novo jogo: {matchEntity.HomeTeam} x {matchEntity.AwayTeam}");
                    }

                    bool anyChange = false;

                    foreach (var extBookmaker in extMatch.Bookmakers)
                    {
                        var h2hMarket = extBookmaker.Markets?.FirstOrDefault(m => m.Key == "h2h");
                        if (h2hMarket == null) continue;

                        if (!bookmakerCache.TryGetValue(extBookmaker.Title, out var bookmaker))
                        {
                            bookmaker = await GetOrCreateBookmaker(unitOfWork, extBookmaker.Title);
                            bookmakerCache[extBookmaker.Title] = bookmaker;
                        }

                        if (await ProcessOdds(matchEntity, extMatch, h2hMarket, bookmaker.Id, notificationService))
                        {
                            anyChange = true;
                        }
                    }

                    // Cálculo de surebet (mantido igual)
                    decimal? currentProfit = null;
                    var bestHome = matchEntity.Odds.Where(o => o.Selection == "Home").MaxBy(o => o.Value)?.Value ?? 0m;
                    var bestDraw = matchEntity.Odds.Where(o => o.Selection == "Draw").MaxBy(o => o.Value)?.Value ?? 0m;
                    var bestAway = matchEntity.Odds.Where(o => o.Selection == "Away").MaxBy(o => o.Value)?.Value ?? 0m;

                    if (bestHome > 0 && bestDraw > 0 && bestAway > 0)
                    {
                        var arbitrage = 1 / bestHome + 1 / bestDraw + 1 / bestAway;

                        if (arbitrage < 0.98m)
                        {
                            currentProfit = ((1 / arbitrage) - 1) * 100;

                            var existingSurebet = matchEntity.Surebets.FirstOrDefault(s => s.IsActive);

                            if (existingSurebet == null)
                            {
                                var newSurebet = new Surebet(matchEntity.Id, currentProfit.Value);
                                matchEntity.Surebets.Add(newSurebet);
                                anyChange = true;

                                _logger.LogWarning($"🚨 NOVA SUREBET DETECTADA: {matchEntity.HomeTeam} x {matchEntity.AwayTeam} → +{currentProfit:F2}% lucro garantido!");

                                await notificationService.SendSurebetAlertAsync(
                                    matchEntity.HomeTeam,
                                    matchEntity.AwayTeam,
                                    currentProfit.Value
                                );
                            }
                            else if (Math.Abs(existingSurebet.ProfitPercent - currentProfit.Value) > 0.1m)
                            {
                                existingSurebet.UpdateProfit(currentProfit.Value);
                                anyChange = true;
                            }
                        }
                        else if (matchEntity.Surebets.Any(s => s.IsActive))
                        {
                            foreach (var s in matchEntity.Surebets.Where(s => s.IsActive))
                            {
                                s.Deactivate();
                            }
                            anyChange = true;
                        }
                    }

                    if (anyChange && existingMatch != null)
                    {
                        _logger.LogInformation($"🔄 Odds/Surebets atualizadas: {matchEntity.HomeTeam} x {matchEntity.AwayTeam}");
                    }
                }

                await unitOfWork.CommitAsync();
                await cacheService.RemoveAsync("matches_all");
                _logger.LogInformation("✅ Sincronização completa e cache limpo!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro na sincronização com The Odds API");
            }

            _logger.LogInformation($"💤 Próxima execução em {interval.TotalMinutes} minutos...");
            await Task.Delay(interval, stoppingToken);
        }
    }

    private async Task<bool> ProcessOdds(
    Match match,
    ExternalMatch extMatch,
    TheOddsApiMarket h2hMarket,
    Guid bookmakerId,
    INotificationService notificationService)
    {
        bool changed = false;

        foreach (var outcome in h2hMarket.Outcomes)
        {
            string selection = outcome.Name switch
            {
                var n when string.Equals(n, extMatch.HomeTeam, StringComparison.OrdinalIgnoreCase) => "Home",
                var n when string.Equals(n, extMatch.AwayTeam, StringComparison.OrdinalIgnoreCase) => "Away",
                "Draw" or "Empate" => "Draw",
                _ => "Draw"
            };

            var existingOdd = match.Odds.FirstOrDefault(o =>
                o.BookmakerId == bookmakerId && o.Selection == selection);

            if (existingOdd != null)
            {
                if (Math.Abs(existingOdd.Value - outcome.Price) > 0.001m)
                {
                    // Salva histórico antes de atualizar
                    existingOdd.History.Add(new OddHistory(existingOdd.Id, existingOdd.Value));

                    // Calcula drop %
                    var previousValue = existingOdd.Value;
                    var dropPercent = ((previousValue - outcome.Price) / previousValue) * 100;

                    existingOdd.UpdateValue(outcome.Price);
                    changed = true;

                    if (dropPercent > 10)
                    {
                        _logger.LogWarning($"DROPPING ODDS: {match.HomeTeam} x {match.AwayTeam} ({selection}) caiu {dropPercent:F1}% na {existingOdd.Bookmaker.Name}");

                        if (dropPercent > 15)
                        {
                            await notificationService.SendDroppingOddsAlertAsync(
                                match.HomeTeam,
                                match.AwayTeam,
                                selection,
                                dropPercent,
                                existingOdd.Bookmaker.Name
                            );
                        }
                    }
                }
            }
            else
            {
                var newOdd = new Odd(
                    value: outcome.Price,
                    marketName: "MoneyLine",
                    selection: selection,
                    matchId: match.Id,
                    bookmakerId: bookmakerId
                );
                match.Odds.Add(newOdd);
                changed = true;

                // Primeiro histórico
                newOdd.History.Add(new OddHistory(newOdd.Id, outcome.Price));
            }
        }

        return changed;
    }

    private async Task<Bookmaker> GetOrCreateBookmaker(IUnitOfWork uow, string title)
    {
        var existing = await uow.Bookmakers.GetByNameAsync(title);
        if (existing != null) return existing;

        var slug = title.ToLower()
            .Replace(" ", "")
            .Replace(".", "")
            .Replace("&", "");

        var (websiteUrl, affiliateUrl) = title switch
        {
            "Betano" => ("https://www.betano.com", "https://www.betano.com/?aff=SEU_CODIGO_BETANO_AQUI"),
            "Bet365" => ("https://www.bet365.com", "https://www.bet365.com/?affiliate=SEU_CODIGO_BET365_AQUI"),
            "Pinnacle" => ("https://www.pinnacle.com", "https://www.pinnacle.com/?tag=SEU_TAG_PINNACLE_AQUI"),
            "Betfair" => ("https://www.betfair.com", "https://www.betfair.com/exchange/plus/?aff=SEU_ID_BETFAIR_AQUI"),
            "William Hill" => ("https://sports.williamhill.com", "https://sports.williamhill.com/betting/en-gb?aff=SEU_CODIGO_AQUI"),
            "Betway" => ("https://betway.com", "https://betway.com/?aff=SEU_ID_BETWAY_AQUI"),
            "888sport" => ("https://www.888sport.com", "https://www.888sport.com/?aff=SEU_ID_888_AQUI"),
            _ => ($"https://www.{slug}.com", null)
        };

        var newBookmaker = new Bookmaker(
            name: title,
            websiteUrl: websiteUrl,
            affiliateUrl: affiliateUrl ?? websiteUrl
        );

        await uow.Bookmakers.AddAsync(newBookmaker);
        _logger.LogInformation($"Nova casa de apostas criada: {title} | Afiliado: {(affiliateUrl != null ? "SIM" : "NÃO")}");

        return newBookmaker;
    }
}