using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Entities
{
    public class Bookmaker
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; } 
        public string WebsiteUrl { get; private set; }

        public Bookmaker(string name, string websiteUrl)
        {
            Id = Guid.NewGuid();
            Name = name;
            WebsiteUrl = websiteUrl;
        }
        protected Bookmaker() { }
    }
}
