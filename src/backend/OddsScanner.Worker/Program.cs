using OddsScanner.Infrastructure;
using OddsScanner.Worker;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<Worker>();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddHttpClient<OddsApiClient>();

builder.Services.AddHostedService<Worker>();
var host = builder.Build();
host.Run();
