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
            const string cacheKey = "matches_all";

            var cachedMatches = await _cacheService.GetAsync<List<MatchDto>>(cacheKey);
            if (cachedMatches != null)
            {
                return cachedMatches;
            }

            var matches = await _unitOfWork.Matches.GetAllAsync();

            var dtos = matches.Select(m => new MatchDto(
                m.Id,
                m.HomeTeam,
                m.AwayTeam,
                m.StartTime,
                m.League,
                m.Odds.Select(o => new OddDto(
                    o.Bookmaker.Name,
                    o.Value,
                    o.Selection
                )).ToList()
            )).ToList();


            await _cacheService.SetAsync(cacheKey, dtos, TimeSpan.FromSeconds(10));

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
        }
    }
}
