using OddsScanner.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Domain.Interfaces
{
    public interface IMatchRepository
    {
        Task<Match?> GetByIdAsync(Guid id);
        Task<List<Match>> GetAllAsync();
        Task<List<Match>> GetAllForUpdateAsync();
        Task AddAsync(Match match);
        Task UpdateAsync(Match match);
        Task<List<Match>> GetAllWithOddsAndBookmakersAsync();
        Task SaveChangesAsync();
    }
}
