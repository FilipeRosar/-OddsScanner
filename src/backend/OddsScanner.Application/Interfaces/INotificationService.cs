using OddsScanner.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OddsScanner.Application.Interfaces
{
    public interface INotificationService
    {
        Task SendSurebetAlertAsync(string homeTeam, string awayTeam, decimal profitPercent);
    }
}
