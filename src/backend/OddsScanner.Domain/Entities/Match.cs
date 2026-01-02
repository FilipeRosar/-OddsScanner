using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Entities
{
    public class Match : BaseEntity
    {
        [JsonPropertyName("home_team")]
        public string HomeTeam { get; private set; } = string.Empty;
        [JsonPropertyName("away_team")]
        public string AwayTeam { get; private set; } = string.Empty;
        [JsonPropertyName("start_time")]
        public DateTime StartTime { get; private set; }
        [JsonPropertyName("league")]
        public string League { get; private set; } = string.Empty;
        [JsonPropertyName("odds")]
        public ICollection<Odd> Odds { get; private set; } = new List<Odd>();
        [JsonPropertyName("surebets")]
        public ICollection<Surebet> Surebets { get; private set; } = new List<Surebet>();

        // Backing fields para estatísticas
        private readonly List<H2HGame> _headToHead = new();
        private readonly List<FormGame> _homeForm = new();
        private readonly List<FormGame> _awayForm = new();

        public IReadOnlyCollection<H2HGame> HeadToHead => _headToHead.AsReadOnly();
        public IReadOnlyCollection<FormGame> HomeForm => _homeForm.AsReadOnly();
        public IReadOnlyCollection<FormGame> AwayForm => _awayForm.AsReadOnly();
        [JsonPropertyName("avg_goals")]
        public decimal AvgGoals { get; private set; }
        [JsonPropertyName("avg_corners")]
        public decimal AvgCorners { get; private set; }
        [JsonPropertyName("is_live")]
        public bool IsLive => DateTime.UtcNow >= StartTime.AddMinutes(-5);
        [JsonPropertyName("home_team_logo")]
        public string? HomeTeamLogo { get; private set; }

        [JsonPropertyName("away_team_logo")]
        public string? AwayTeamLogo { get; private set; }
        protected Match() { } 

        public Match(string homeTeam, string awayTeam, DateTime startTime, string league)
        {
            HomeTeam = homeTeam ?? throw new ArgumentNullException(nameof(homeTeam));
            AwayTeam = awayTeam ?? throw new ArgumentNullException(nameof(awayTeam));
            StartTime = startTime.ToUniversalTime();
            League = league ?? throw new ArgumentNullException(nameof(league));
        }

        public void SetStatistics(
            IEnumerable<H2HGame> headToHead,
            IEnumerable<FormGame> homeForm,
            IEnumerable<FormGame> awayForm,
            decimal avgGoals,
            decimal avgCorners)
        {
            _headToHead.Clear();
            if (headToHead != null) _headToHead.AddRange(headToHead);

            _homeForm.Clear();
            if (homeForm != null) _homeForm.AddRange(homeForm);

            _awayForm.Clear();
            if (awayForm != null) _awayForm.AddRange(awayForm);

            AvgGoals = avgGoals;
            AvgCorners = avgCorners;
        }
        public void SetTeamLogos(string? homeLogo, string? awayLogo)
        {
            HomeTeamLogo = homeLogo;
            AwayTeamLogo = awayLogo;
        }
    }

    public class H2HGame
    {
        [JsonPropertyName("date")]
        public DateTime Date { get; set; }
        [JsonPropertyName("home_score")]
        public int HomeScore { get; set; }
        [JsonPropertyName("away_score")]
        public int AwayScore { get; set; }
        [JsonPropertyName("winner")]
        public string Winner { get; set; } = string.Empty; 
    }

    public class FormGame
    {
        [JsonPropertyName("result")]
        public string Result { get; set; } = string.Empty; // "W", "D", "L"
        [JsonPropertyName("opponent")]
        public string Opponent { get; set; } = string.Empty;
    }
}
