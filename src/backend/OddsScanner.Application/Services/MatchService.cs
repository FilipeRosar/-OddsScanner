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
            Console.WriteLine("--- 🔍 INICIANDO DIAGNÓSTICO DA API ---");

            // 1. Busca do Banco
            var matches = await _unitOfWork.Matches.GetAllAsync();
            Console.WriteLine($"📊 Jogos encontrados no Banco: {matches.Count}");

            if (matches.Any())
            {
                var primeiro = matches.First();
                Console.WriteLine($"🧐 Analisando o jogo: {primeiro.HomeTeam} x {primeiro.AwayTeam}");
                Console.WriteLine($"🔢 Quantidade de Odds neste jogo: {primeiro.Odds.Count}");

                if (primeiro.Odds.Any())
                {
                    var odd = primeiro.Odds.First();
                    Console.WriteLine($"💲 Valor da primeira odd: {odd.Value}");
                    Console.WriteLine($"🏠 Casa de aposta (Bookmaker): {(odd.Bookmaker != null ? odd.Bookmaker.Name : "NULO (Erro no Include)")}");
                }
                else
                {
                    Console.WriteLine("❌ ERRO CRÍTICO: O jogo existe, mas a lista de Odds veio vazia do banco.");
                    Console.WriteLine("👉 Provável causa: O MatchRepository não está fazendo o .Include(x => x.Odds) corretamente.");
                }
            }

            // 2. Conversão (Com proteção contra nulos para não quebrar a API)
            var dtos = matches.Select(m => new MatchDto(
                m.Id,
                m.HomeTeam,
                m.AwayTeam,
                m.StartTime,
                m.League,
                m.Odds.Select(o => new OddDto(
                    o.Bookmaker != null ? o.Bookmaker.Name : "Desconhecido", // Proteção
                    o.Value,
                    o.Selection,
                    o.Bookmaker != null ? (o.Bookmaker.WebsiteUrl ?? "") : ""
                )).ToList()
            )).ToList();

            Console.WriteLine("--- ✅ DIAGNÓSTICO FINALIZADO ---");

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
