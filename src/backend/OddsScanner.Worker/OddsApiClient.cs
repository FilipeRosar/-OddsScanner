using OddsScanner.Worker.ExternalModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace OddsScanner.Worker
{
    public class OddsApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<OddsApiClient> _logger;

        public OddsApiClient(HttpClient httpClient, IConfiguration configuration, ILogger<OddsApiClient> logger)
        {
            _httpClient = httpClient;
            _apiKey = configuration["OddsApiKey"] ?? throw new ArgumentNullException("OddsApiKey não configurada");
            _logger = logger;
        }

        public async Task<List<ExternalMatch>> GetUpcomingMatchesAsync()
        {
            // Lista de ligas que queremos monitorar
            var sportKeys = new[]
                {
                    ("soccer_brazil_campeonato", "Brasileirão Série A"),
                    ("soccer_epl", "Premier League"),
                    ("soccer_spain_la_liga", "La Liga"),                   
                    ("soccer_italy_serie_a", "Serie A Itália"),            
                    ("soccer_germany_bundesliga", "Bundesliga"),           
                    ("soccer_uefa_champs_league", "Champions League"),
                    ("soccer_uefa_europa_league", "Europa League"),
                    ("soccer_fifa_world_cup", "Copa do Mundo"),            
                };

            var allMatches = new List<ExternalMatch>();

            foreach (var (sportKey, leagueName) in sportKeys)
            {
                try
                {
                    var url = $"https://api.the-odds-api.com/v4/sports/{sportKey}/odds/" +
                              $"?apiKey={_apiKey}" +
                              "&regions=eu,uk,au" +
                              "&markets=h2h" +
                              "&oddsFormat=decimal" +
                              "&dateFormat=iso";

                    var response = await _httpClient.GetAsync(url);

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning($"Falha ao buscar {leagueName}: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
                        continue;
                    }

                    var json = await response.Content.ReadAsStringAsync();
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var matches = JsonSerializer.Deserialize<List<ExternalMatch>>(json, options);

                    if (matches != null && matches.Any())
                    {
                        foreach (var match in matches)
                        {
                            match.SportKey = sportKey;
                            match.League = leagueName; 
                        }
                        allMatches.AddRange(matches);
                        _logger.LogInformation($"✅ {matches.Count} jogos carregados de {leagueName}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Erro ao buscar dados de {leagueName}");
                }

                await Task.Delay(1200, CancellationToken.None);
            }

            return allMatches;
        }
    }
}