using OddsScanner.Application.Interfaces;
using OddsScanner.Domain.Entities;
using OddsScanner.Domain.Interfaces;

namespace OddsScanner.Worker;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly OddsApiClient _apiClient;

    public Worker(ILogger<Worker> logger, IServiceProvider serviceProvider, OddsApiClient apiClient)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _apiClient = apiClient;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // ⚠️ IMPORTANTE: Ajuste o tempo conforme seu plano da API (Free = 1h, Pago = menos)
        // Para testes rápidos, pode deixar 1 minuto, mas cuidado com a cota.
        var interval = TimeSpan.FromHours(1);

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("🌍 Buscando dados reais da The-Odds-Api...");

            try
            {
                var allExternalMatches = await _apiClient.GetUpcomingMatchesAsync();

                // 1. Filtra duplicatas da API (Agrupa por times e pega o primeiro)
                var externalMatches = allExternalMatches
                    .GroupBy(m => new { m.home_team, m.away_team })
                    .Select(g => g.First())
                    .ToList();

                _logger.LogInformation($"Encontrados {externalMatches.Count} jogos únicos.");

                using (var scope = _serviceProvider.CreateScope())
                {
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    var cacheService = scope.ServiceProvider.GetRequiredService<ICacheService>();

                    // 2. Busca ou cria a Casa de Aposta padrão (Bet365)
                    var bookmaker = await GetOrCreateBookmaker(unitOfWork, "Bet365");

                    // 3. Traz TODOS os jogos do banco UMA VEZ SÓ (fora do loop)
                    var dbMatches = await unitOfWork.Matches.GetAllForUpdateAsync();

                    foreach (var extMatch in externalMatches)
                    {
                        // Tenta achar o jogo na memória carregada
                        var existingMatch = dbMatches.FirstOrDefault(m =>
                            m.HomeTeam == extMatch.home_team &&
                            m.AwayTeam == extMatch.away_team);

                        if (existingMatch == null)
                        {
                            // --- C. CRIAR NOVO JOGO ---
                            var newMatch = new Match(
                                extMatch.home_team,
                                extMatch.away_team,
                                extMatch.commence_time.ToUniversalTime(),
                                "Brasileirão Série A"
                            );

                            // Adiciona as odds (Modo Criação)
                            ProcessOdds(newMatch, extMatch, bookmaker.Id);

                            await unitOfWork.Matches.AddAsync(newMatch);
                            _logger.LogInformation($"➕ Novo jogo: {newMatch.HomeTeam} x {newMatch.AwayTeam}");
                        }
                        else
                        {
                            // --- U. ATUALIZAR JOGO EXISTENTE (SEM DELETE) ---
                            // Apenas atualizamos os valores das odds existentes ou inserimos novas.
                            // NÃO usamos Remove() aqui, o que evita o erro de concorrência.
                            bool updated = ProcessOdds(existingMatch, extMatch, bookmaker.Id);

                            if (updated)
                                _logger.LogInformation($"🔄 Odds Atualizadas: {existingMatch.HomeTeam} x {existingMatch.AwayTeam}");
                        }
                    }

                    // 4. Salva tudo de uma vez
                    await unitOfWork.CommitAsync();

                    // 5. Limpa cache
                    await cacheService.RemoveAsync("matches_all");
                    _logger.LogInformation("✅ Banco Sincronizado e Cache Limpo!");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao sincronizar dados");
            }

            _logger.LogInformation($"💤 Dormindo por {interval.TotalMinutes} minutos...");
            await Task.Delay(interval, stoppingToken);
        }
    }

    // Método inteligente: Atualiza se existe, Cria se não existe
    private bool ProcessOdds(Match match, ExternalModels.ExternalMatch extMatch, Guid bookmakerId)
    {
        var firstBookmaker = extMatch.bookmakers.FirstOrDefault();
        bool anyChange = false;

        if (firstBookmaker != null)
        {
            var market = firstBookmaker.markets.FirstOrDefault(m => m.key == "h2h");
            if (market != null)
            {
                foreach (var outcome in market.outcomes)
                {
                    // Define qual é a seleção (Home, Draw, Away)
                    string selection = "Draw";
                    if (outcome.name == extMatch.home_team) selection = "Home";
                    if (outcome.name == extMatch.away_team) selection = "Away";

                    // 1. Tenta encontrar a Odd existente no jogo
                    var existingOdd = match.Odds.FirstOrDefault(o =>
                        o.BookmakerId == bookmakerId &&
                        o.Selection == selection);

                    if (existingOdd != null)
                    {
                        // UPDATE: Se já existe, só atualiza o preço
                        if (existingOdd.Value != outcome.price)
                        {
                            existingOdd.UpdateValue(outcome.price);
                            anyChange = true;
                        }
                    }
                    else
                    {
                        // INSERT: Se não existe, cria nova
                        match.Odds.Add(new Odd(outcome.price, "MoneyLine", selection, match.Id, bookmakerId));
                        anyChange = true;
                    }
                }
            }
        }
        return anyChange;
    }

    private async Task<Bookmaker> GetOrCreateBookmaker(IUnitOfWork uow, string name)
    {
        var existing = await uow.Bookmakers.GetByNameAsync(name);
        if (existing != null) return existing;

        var newBookmaker = new Bookmaker(name, "www.oddsapi.com");
        await uow.Bookmakers.AddAsync(newBookmaker);
        await uow.CommitAsync();
        return newBookmaker;
    }
}