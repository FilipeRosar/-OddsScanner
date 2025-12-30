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

        public OddsApiClient(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["OddsApiKey"] ?? throw new ArgumentNullException("OddsApiKey não configurada");
        }

        public async Task<List<ExternalMatch>> GetUpcomingMatchesAsync(
            string sportKey = "soccer_brazil_campeonato",
            string regions = "eu,uk,au", 
            string markets = "h2h")
        {
            var url = $"https://api.the-odds-api.com/v4/sports/{sportKey}/odds/" +
                      $"?apiKey={_apiKey}" +
                      $"&regions={regions}" +
                      $"&markets={markets}" +
                      "&oddsFormat=decimal" +
                      "&dateFormat=iso";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Erro na The Odds API: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
                return new List<ExternalMatch>();
            }

            var json = await response.Content.ReadAsStringAsync();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var matches = JsonSerializer.Deserialize<List<ExternalMatch>>(json, options);

            return matches ?? new List<ExternalMatch>();
        }
    }
}