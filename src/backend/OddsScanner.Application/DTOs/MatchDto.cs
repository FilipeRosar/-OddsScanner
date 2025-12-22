using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Application.DTOs
{
    public record OddDto(
    string BookmakerName,
    decimal Value,
    string Selection 
    );
    public record MatchDto(
    Guid Id,
    string HomeTeam,
    string AwayTeam,
    DateTime StartTime,
    string League,
    List<OddDto> Odds 
);
}
