using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Worker.ExternalModels
{
    public class ExternalMatch
    {
        public string id { get; set; }
        public string home_team { get; set; }
        public string away_team { get; set; }
        public DateTime commence_time { get; set; }
        public List<ExternalBookmaker> bookmakers { get; set; }
    }

    public class ExternalBookmaker
    {
        public string key { get; set; } 
        public string title { get; set; } 
        public List<ExternalMarket> markets { get; set; }
    }

    public class ExternalMarket
    {
        public string key { get; set; } 
        public List<ExternalOutcome> outcomes { get; set; }
    }

    public class ExternalOutcome
    {
        public string name { get; set; } 
        public decimal price { get; set; } 
    }
}
