using OddsScanner.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Application.Interfaces
{
    public interface IMatchService
    {
        Task<List<MatchDto>> GetAllMatchesAsync();
        Task CreateTestMatchAsync(); 
    }
}
