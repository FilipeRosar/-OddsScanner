using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Entities
{
    public class Match
    {
        public Guid Id { get; private set; }
        public string HomeTeam { get; private set; }
        public string AwayTeam { get; private set; }
        public DateTime StartTime { get; private set; }
        public string League { get; private set; }

        public ICollection<Odd> Odds { get; private set; } = new List<Odd>();

        public Match(string homeTeam, string awayTeam, DateTime startTime, string league)
        {
            Id = Guid.NewGuid();
            HomeTeam = homeTeam;
            AwayTeam = awayTeam;
            StartTime = startTime;
            League = league;
        }
        protected Match() { }
    }
}
