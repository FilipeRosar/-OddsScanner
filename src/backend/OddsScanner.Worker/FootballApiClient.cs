using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OddsScanner.Domain.Entities;
using System.Globalization;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace OddsScanner.Worker
{
    public class FootballApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<FootballApiClient> _logger;

        // Caches para IDs e Logos
        private Dictionary<string, int> _teamCache = new(StringComparer.OrdinalIgnoreCase);
        private Dictionary<string, string> _teamLogoCache = new(StringComparer.OrdinalIgnoreCase);
        private Dictionary<string, int> _leagueCache = new(StringComparer.OrdinalIgnoreCase);

        public FootballApiClient(HttpClient httpClient, IConfiguration configuration, ILogger<FootballApiClient> logger)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri("https://v3.football.api-sports.io/");
            _apiKey = configuration["FootballApiKey"] ?? throw new ArgumentNullException("FootballApiKey não configurada");
            _logger = logger;
        }

        public async Task EnrichMatchStatsAsync(Match match)
        {
            try
            {
                int homeTeamId = GetTeamId(match.HomeTeam);
                int awayTeamId = GetTeamId(match.AwayTeam);
                int leagueId = GetLeagueId(match.League);
                int season = DateTime.Now.Year;

                // Atribui as logos a partir do cache mapeado no InitializeMappingAsync
                var homeLogo = GetTeamLogo(match.HomeTeam);
                var awayLogo = GetTeamLogo(match.AwayTeam);

                match.SetTeamLogos(homeLogo, awayLogo);

                if (homeTeamId == 0 || awayTeamId == 0)
                {
                    _logger.LogWarning($"Estatísticas abortadas: Time não mapeado ({match.HomeTeam} ou {match.AwayTeam})");
                    return;
                }

                // Chamadas em paralelo para performance
                var h2hTask = GetHeadToHeadAsync(homeTeamId, awayTeamId, 5);
                var homeFormTask = GetTeamFormAsync(homeTeamId, leagueId, season, 5);
                var awayFormTask = GetTeamFormAsync(awayTeamId, leagueId, season, 5);
                var homeStatsTask = GetTeamStatisticsAsync(homeTeamId, leagueId, season);
                var awayStatsTask = GetTeamStatisticsAsync(awayTeamId, leagueId, season);

                await Task.WhenAll(h2hTask, homeFormTask, awayFormTask, homeStatsTask, awayStatsTask);

                decimal avgGoals = (homeStatsTask.Result.AvgGoals + awayStatsTask.Result.AvgGoals) / 2;
                decimal avgCorners = (homeStatsTask.Result.AvgCorners + awayStatsTask.Result.AvgCorners) / 2;

                match.SetStatistics(
                    h2hTask.Result,
                    homeFormTask.Result,
                    awayFormTask.Result,
                    avgGoals,
                    avgCorners
                );

                _logger.LogInformation($"✅ Stats & Logos carregados: {match.HomeTeam} x {match.AwayTeam}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erro ao enriquecer stats de {match.HomeTeam} x {match.AwayTeam}");
            }
        }

        #region Mapeamento e IDs
        public int GetTeamId(string teamName)
        {
            var normalizedInput = NormalizeName(teamName);
            return _teamCache.TryGetValue(normalizedInput, out int id) ? id : 0;
        }

        public string? GetTeamLogo(string teamName)
        {
            var normalizedInput = NormalizeName(teamName);
            return _teamLogoCache.TryGetValue(normalizedInput, out string? logo) ? logo : null;
        }

        private int GetLeagueId(string leagueName)
        {
            var normalizedInput = NormalizeName(leagueName);
            return _leagueCache.TryGetValue(normalizedInput, out int id) ? id : 0;
        }

        public async Task InitializeMappingAsync()
        {
            try
            {
                _logger.LogInformation("Iniciando mapeamento automático de Ligas, Times e Logos...");

                // 1. Mapear Ligas
                var leaguesJson = await SendRequestAsync("leagues");
                if (!string.IsNullOrEmpty(leaguesJson))
                {
                    using var doc = JsonDocument.Parse(leaguesJson);
                    foreach (var element in doc.RootElement.GetProperty("response").EnumerateArray())
                    {
                        var league = element.GetProperty("league");
                        var name = league.GetProperty("name").GetString();
                        var id = league.GetProperty("id").GetInt32();
                        if (!string.IsNullOrEmpty(name))
                            _leagueCache[NormalizeName(name)] = id;
                    }
                }

                // 2. Mapear Times e Logos das ligas principais
                int[] activeLeagues = { 39, 71, 140, 135, 78, 61, 94 };
                foreach (var leagueId in activeLeagues)
                {
                    var teamsJson = await SendRequestAsync($"teams?league={leagueId}&season={DateTime.Now.Year}");
                    if (!string.IsNullOrEmpty(teamsJson))
                    {
                        using var doc = JsonDocument.Parse(teamsJson);
                        foreach (var element in doc.RootElement.GetProperty("response").EnumerateArray())
                        {
                            var team = element.GetProperty("team");
                            var name = team.GetProperty("name").GetString();
                            var id = team.GetProperty("id").GetInt32();
                            var logo = team.GetProperty("logo").GetString();

                            if (!string.IsNullOrEmpty(name))
                            {
                                var normalized = NormalizeName(name);
                                _teamCache[normalized] = id;
                                if (!string.IsNullOrEmpty(logo))
                                    _teamLogoCache[normalized] = logo;
                            }
                        }
                    }
                }
                _logger.LogInformation($"Mapeamento concluído: {_leagueCache.Count} ligas e {_teamCache.Count} times com logos.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao automatizar mapeamento da API.");
            }
        }
        #endregion

        #region Chamadas de API
        private async Task<List<H2HGame>> GetHeadToHeadAsync(int team1Id, int team2Id, int limit)
        {
            var url = $"fixtures/headtohead?h2h={team1Id}-{team2Id}&last={limit}";
            var json = await SendRequestAsync(url);
            return string.IsNullOrEmpty(json) ? new List<H2HGame>() : ParseH2H(json);
        }

        private async Task<InternalTeamStats> GetTeamStatisticsAsync(int teamId, int leagueId, int season)
        {
            var url = $"teams/statistics?team={teamId}&league={leagueId}&season={season}";
            var json = await SendRequestAsync(url);
            return string.IsNullOrEmpty(json) ? new InternalTeamStats() : ParseTeamStats(json);
        }

        private async Task<List<FormGame>> GetTeamFormAsync(int teamId, int leagueId, int season, int limit)
        {
            var url = $"fixtures?team={teamId}&league={leagueId}&season={season}&last={limit}";
            var json = await SendRequestAsync(url);
            return string.IsNullOrEmpty(json) ? new List<FormGame>() : ParseForm(json, teamId);
        }

        private async Task<string?> SendRequestAsync(string endpoint)
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
                request.Headers.Add("x-apisports-key", _apiKey);
                var response = await _httpClient.SendAsync(request);
                return response.IsSuccessStatusCode ? await response.Content.ReadAsStringAsync() : null;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro na requisição para {endpoint}: {ex.Message}");
                return null;
            }
        }
        #endregion

        #region Parsers
        private List<H2HGame> ParseH2H(string json)
        {
            using var doc = JsonDocument.Parse(json);
            var response = doc.RootElement.GetProperty("response");

            return response.EnumerateArray().Select(game => new H2HGame
            {
                Date = game.GetProperty("fixture").GetProperty("date").GetDateTime(),
                HomeScore = game.GetProperty("goals").GetProperty("home").GetInt32(),
                AwayScore = game.GetProperty("goals").GetProperty("away").GetInt32(),
                Winner = game.GetProperty("teams").GetProperty("home").GetProperty("winner").GetBoolean() ? "home" :
                         game.GetProperty("teams").GetProperty("away").GetProperty("winner").GetBoolean() ? "away" : "draw"
            }).ToList();
        }

        private List<FormGame> ParseForm(string json, int targetTeamId)
        {
            using var doc = JsonDocument.Parse(json);
            var response = doc.RootElement.GetProperty("response");

            return response.EnumerateArray().Select(fixture =>
            {
                var teams = fixture.GetProperty("teams");
                bool isHome = teams.GetProperty("home").GetProperty("id").GetInt32() == targetTeamId;

                var homeWinner = teams.GetProperty("home").GetProperty("winner").ValueKind != JsonValueKind.Null && teams.GetProperty("home").GetProperty("winner").GetBoolean();
                var awayWinner = teams.GetProperty("away").GetProperty("winner").ValueKind != JsonValueKind.Null && teams.GetProperty("away").GetProperty("winner").GetBoolean();

                string result = isHome ? (homeWinner ? "W" : (awayWinner ? "L" : "D")) : (awayWinner ? "W" : (homeWinner ? "L" : "D"));

                return new FormGame
                {
                    Result = result,
                    Opponent = isHome ? teams.GetProperty("away").GetProperty("name").GetString()! : teams.GetProperty("home").GetProperty("name").GetString()!
                };
            }).ToList();
        }

        private InternalTeamStats ParseTeamStats(string json)
        {
            using var doc = JsonDocument.Parse(json);
            var res = doc.RootElement.GetProperty("response");

            string avgGoalsStr = "0";
            if (res.GetProperty("goals").GetProperty("for").TryGetProperty("average", out var avgNode))
                avgGoalsStr = avgNode.GetString() ?? "0";

            decimal avgGoals = decimal.Parse(avgGoalsStr, CultureInfo.InvariantCulture);

            decimal avgCorners = 9.5m;
            if (res.TryGetProperty("corners", out var cornersNode))
            {
                var avgCornersNode = cornersNode.GetProperty("average");
                string cStr = avgCornersNode.GetProperty("total").GetString() ?? "9.5";
                avgCorners = decimal.Parse(cStr, CultureInfo.InvariantCulture);
            }

            return new InternalTeamStats { AvgGoals = avgGoals, AvgCorners = avgCorners };
        }

        private string NormalizeName(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return string.Empty;
            string normalizedString = name.ToLowerInvariant().Trim();
            var unicode = normalizedString.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in unicode)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                    stringBuilder.Append(c);
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }
        #endregion

        private class InternalTeamStats
        {
            public decimal AvgGoals { get; set; } = 0;
            public decimal AvgCorners { get; set; } = 9.5m;
        }
    }
}