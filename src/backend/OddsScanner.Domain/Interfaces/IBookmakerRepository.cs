using OddsScanner.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Interfaces
{
    public interface IBookmakerRepository
    {
        Task AddAsync(Bookmaker bookmaker);
    }
}
