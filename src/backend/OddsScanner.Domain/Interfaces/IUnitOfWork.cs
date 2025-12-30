using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Interfaces
{
    public interface IUnitOfWork
    {
        IMatchRepository Matches { get; }
        IBookmakerRepository Bookmakers { get; }
        ISubscriberRepository Subscribers { get; }
        Task CommitAsync();
    }
}
