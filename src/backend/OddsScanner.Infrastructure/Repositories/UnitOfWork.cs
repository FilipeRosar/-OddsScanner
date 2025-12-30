using OddsScanner.Domain.Interfaces;
using OddsScanner.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly OddsScannerDbContext _context;
        private IBookmakerRepository? _bookmakerRepository;
        private IMatchRepository? _matchRepository;

        public UnitOfWork(OddsScannerDbContext context)
        {
            _context = context;
        }

        public IMatchRepository Matches
        {
            get
            {
                return _matchRepository ??= new MatchRepository(_context);
            }
        }
        public IBookmakerRepository Bookmakers
        {
            get { return _bookmakerRepository ??= new BookmakerRepository(_context); }
        }
        public ISubscriberRepository Subscribers
        {
            get { return new SubscriberRepository(_context); }
        }
        public async Task CommitAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
