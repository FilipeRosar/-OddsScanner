using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OddsScanner.Application.Interfaces;
using OddsScanner.Domain.Interfaces;
using OddsScanner.Infrastructure.Persistence;
using OddsScanner.Infrastructure.Repositories;
using OddsScanner.Infrastructure.Services;

namespace OddsScanner.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<OddsScannerDbContext>(options =>
                options.UseNpgsql(connectionString));

            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = configuration.GetConnectionString("Redis");
            });

            services.AddScoped<ICacheService, RedisCacheService>();
            services.AddScoped<IMatchService, Application.Services.MatchService>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            return services;
        }
    }
}
