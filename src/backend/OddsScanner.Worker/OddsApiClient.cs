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
            _apiKey = configuration["OddsApiKey"]; 
        }

        public async Task<List<ExternalMatch>> GetUpcomingMatchesAsync()
        {
            var url = $"https://api.the-odds-api.com/v4/sports/soccer_brazil_campeonato/odds/?apiKey={_apiKey}&regions=eu,uk&markets=h2h";

            var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Erro na API Externa: {response.StatusCode}");
                return new List<ExternalMatch>();
            }

            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<List<ExternalMatch>>(json) ?? new List<ExternalMatch>();
        }

    }
}