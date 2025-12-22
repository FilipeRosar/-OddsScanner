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
    public record MatchDto(
     [property: JsonPropertyName("id")] Guid Id,
     [property: JsonPropertyName("homeTeam")] string HomeTeam,
     [property: JsonPropertyName("awayTeam")] string AwayTeam,
     [property: JsonPropertyName("startTime")] DateTime StartTime,
     [property: JsonPropertyName("league")] string League,
     [property: JsonPropertyName("odds")] List<OddDto> Odds
 );
}
