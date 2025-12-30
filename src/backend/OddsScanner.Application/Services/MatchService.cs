using OddsScanner.Application.DTOs;
using OddsScanner.Application.Interfaces;
using OddsScanner.Domain.Entities;
using OddsScanner.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Application.Services
{
    public class MatchService : IMatchService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService; 

        public MatchService(IUnitOfWork unitOfWork, ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
        }

        public async Task<List<MatchDto>> GetAllMatchesAsync()
        {
            Console.WriteLine("--- INICIANDO BUSCA DE JOGOS ---");

            var matches = await _unitOfWork.Matches.GetAllWithOddsAndBookmakersAsync();

            Console.WriteLine($"Jogos encontrados no banco: {matches.Count}");

            if (matches.Any())
            {
                var primeiro = matches.First();
                Console.WriteLine($"Primeiro jogo: {primeiro.HomeTeam} x {primeiro.AwayTeam}");
                Console.WriteLine($"Odds carregadas: {primeiro.Odds.Count}");

                foreach (var odd in primeiro.Odds.Take(6))
                {
                    Console.WriteLine($" → {odd.Selection}: {odd.Value:F2} @ {odd.Bookmaker?.Name ?? "NULO"}");
                }
            }

            var dtos = matches.Select(m =>
            {
                var oddDtos = m.Odds.Select(o => new OddDto(
                    o.Bookmaker?.Name ?? "Desconhecido",
                    o.Value,
                    o.Selection,
                    o.Bookmaker?.WebsiteUrl ?? ""
                )).ToList();

                string? surebetProfit = null;
                var homeOdds = oddDtos.Where(o => o.Selection == "Home").ToList();
                var drawOdds = oddDtos.Where(o => o.Selection == "Draw").ToList();
                var awayOdds = oddDtos.Where(o => o.Selection == "Away").ToList();

                if (homeOdds.Any() && drawOdds.Any() && awayOdds.Any())
                {
                    var bestHome = homeOdds.MaxBy(o => o.Value)?.Value ?? 0m;
                    var bestDraw = drawOdds.MaxBy(o => o.Value)?.Value ?? 0m;
                    var bestAway = awayOdds.MaxBy(o => o.Value)?.Value ?? 0m;

                    if (bestHome > 0 && bestDraw > 0 && bestAway > 0)
                    {
                        var arbitrage = 1 / bestHome + 1 / bestDraw + 1 / bestAway;

                        if (arbitrage < 0.98m) 
                        {
                            var profit = ((1 / arbitrage) - 1) * 100;
                            surebetProfit = profit.ToString("F2");
                            Console.WriteLine($"SUREBET DETECTADA: {m.HomeTeam} x {m.AwayTeam} → +{surebetProfit}%");
                        }
                    }
                }

                return new MatchDto
                {
                    Id = m.Id,
                    HomeTeam = m.HomeTeam,
                    AwayTeam = m.AwayTeam,
                    StartTime = m.StartTime,
                    League = m.League,
                    Odds = oddDtos,
                    SurebetProfit = surebetProfit
                };
            }).ToList();

            Console.WriteLine($"DTOs gerados: {dtos.Count}");
            Console.WriteLine("--- BUSCA FINALIZADA ---");

            return dtos;
        }
        public async Task CreateTestMatchAsync()
        {
            var bet365 = new Bookmaker("Bet365", "www.bet365.com");


            await _unitOfWork.Bookmakers.AddAsync(bet365);

            var match = new Match("São Paulo", "Corinthians", DateTime.UtcNow.AddDays(2), "Brasileirão");

            match.Odds.Add(new Odd(2.10m, "MoneyLine", "Home", match.Id, bet365.Id));
            match.Odds.Add(new Odd(3.20m, "MoneyLine", "Draw", match.Id, bet365.Id));
            match.Odds.Add(new Odd(3.50m, "MoneyLine", "Away", match.Id, bet365.Id));

            await _unitOfWork.Matches.AddAsync(match);

            await _unitOfWork.CommitAsync();

            await _cacheService.RemoveAsync("matches_all");
            await Task.CompletedTask;
        }
    }
}
