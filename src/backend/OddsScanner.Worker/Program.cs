using OddsScanner.Application.Services;
using OddsScanner.Infrastructure;
using OddsScanner.Worker;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<Worker>();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddHttpClient<OddsApiClient>();
builder.Services.AddHttpClient<INotificationService, NotificationService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHostedService<Worker>();
var host = builder.Build();
host.Run();
