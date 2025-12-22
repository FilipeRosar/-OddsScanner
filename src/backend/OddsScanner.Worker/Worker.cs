using OddsScanner.Application.Interfaces;
using OddsScanner.Domain.Interfaces;

namespace OddsScanner.Worker;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly Random _random = new();

    public Worker(ILogger<Worker> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("🔄 Worker: Analisando mercado e atualizando Odds... {time}", DateTimeOffset.Now);

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    var cacheService = scope.ServiceProvider.GetRequiredService<ICacheService>();

                    var matches = await unitOfWork.Matches.GetAllForUpdateAsync();

                    foreach (var match in matches)
                    {
                        foreach (var odd in match.Odds)
                        {
                            var variation = (decimal)(_random.NextDouble() * 0.10 - 0.05);
                            odd.UpdateValue(odd.Value + (odd.Value * variation));
                        }


                    }

                    await unitOfWork.CommitAsync();

                    await cacheService.RemoveAsync("matches_all");

                    _logger.LogInformation("✅ Odds atualizadas e Cache limpo!");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erro ao atualizar Odds");
            }

            await Task.Delay(5000, stoppingToken);
        }
    }
}