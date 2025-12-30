using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OddsScanner.Application.DTOs
{
    public record OddDto(
    [property: JsonPropertyName("bookmakerName")]
    string BookmakerName,
    [property: JsonPropertyName("value")]
    decimal Value,
    [property: JsonPropertyName("selection")]
    string Selection,
    [property: JsonPropertyName("bookmakerUrl")]
    string BookmakerUrl
);
    public record MatchDto
    {
        [JsonPropertyName("id")] public Guid Id { get; init; }
        [JsonPropertyName("homeTeam")] public string HomeTeam { get; init; } = string.Empty;
        [JsonPropertyName("awayTeam")] public string AwayTeam { get; init; } = string.Empty;
        [JsonPropertyName("startTime")] public DateTime StartTime { get; init; }
        [JsonPropertyName("league")] public string League { get; init; } = string.Empty;
        [JsonPropertyName("odds")] public List<OddDto> Odds { get; init; } = new();

        [JsonPropertyName("isLive")]
        public bool IsLive => DateTime.UtcNow > StartTime;
        [JsonPropertyName("surebetProfit")]
        public string? SurebetProfit { get; init; }
    }
}
