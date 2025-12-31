using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Entities
{
    public class Match : BaseEntity
    {
        public string HomeTeam { get; private set; } = string.Empty;
        public string AwayTeam { get; private set; } = string.Empty;
        public DateTime StartTime { get; private set; }
        public string League { get; private set; } = string.Empty;

        public ICollection<Odd> Odds { get; private set; } = new List<Odd>();
        public ICollection<Surebet> Surebets { get; private set; } = new List<Surebet>();

        // Backing fields para estatísticas
        private readonly List<H2HGame> _headToHead = new();
        private readonly List<FormGame> _homeForm = new();
        private readonly List<FormGame> _awayForm = new();

        // Propriedades públicas somente leitura
        public IReadOnlyCollection<H2HGame> HeadToHead => _headToHead.AsReadOnly();
        public IReadOnlyCollection<FormGame> HomeForm => _homeForm.AsReadOnly();
        public IReadOnlyCollection<FormGame> AwayForm => _awayForm.AsReadOnly();

        public decimal AvgGoals { get; private set; }
        public decimal AvgCorners { get; private set; }

        public bool IsLive => DateTime.UtcNow >= StartTime.AddMinutes(-5);

        protected Match() { } // para EF Core

        public Match(string homeTeam, string awayTeam, DateTime startTime, string league)
        {
            HomeTeam = homeTeam ?? throw new ArgumentNullException(nameof(homeTeam));
            AwayTeam = awayTeam ?? throw new ArgumentNullException(nameof(awayTeam));
            StartTime = startTime.ToUniversalTime();
            League = league ?? throw new ArgumentNullException(nameof(league));
        }

        // Método para enriquecer com estatísticas reais
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
    }

    public class H2HGame
    {
        public DateTime Date { get; set; }
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
        public string Winner { get; set; } = string.Empty; 
    }

    public class FormGame
    {
        public string Result { get; set; } = string.Empty; // "W", "D", "L"
        public string Opponent { get; set; } = string.Empty;
    }
}
