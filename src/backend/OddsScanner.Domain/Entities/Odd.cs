using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Entities
{
    public class Odd
    {
        public Guid Id { get; private set; }
        public decimal Value { get; private set; } 
        public string MarketType { get; private set; } 
        public string Selection { get; private set; } 
        public DateTime LastUpdated { get; private set; }

        public Guid MatchId { get; private set; }
        public Match Match { get; private set; }

        public Guid BookmakerId { get; private set; }
        public Bookmaker Bookmaker { get; private set; }

        public Odd(decimal value, string marketType, string selection, Guid matchId, Guid bookmakerId)
        {
            Id = Guid.NewGuid();
            Value = value;
            MarketType = marketType;
            Selection = selection;
            MatchId = matchId;
            BookmakerId = bookmakerId;
            LastUpdated = DateTime.UtcNow;
        }
        public void UpdateValue(decimal newValue)
        {
            if (newValue < 1.01m) newValue = 1.01m;

            Value = Math.Round(newValue, 2); 
            LastUpdated = DateTime.UtcNow;
        }
        protected Odd() { }
    }
}
