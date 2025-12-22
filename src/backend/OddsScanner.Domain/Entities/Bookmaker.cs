using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Entities
{
    public class Bookmaker : BaseEntity
    {
        public string Name { get; private set; } 
        public string WebsiteUrl { get; private set; }

        public Bookmaker(string name, string websiteUrl)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Nome é obrigatório");

            Name = name;
            WebsiteUrl = websiteUrl;
        }
        protected Bookmaker() { }
    }
}
