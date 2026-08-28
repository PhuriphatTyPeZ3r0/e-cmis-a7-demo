using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.JSInterop;
using EcmisWeb.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<EcmisWeb.App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// HttpClient หลัก — ชี้ไปที่ ecmis-web host (static files)
builder.Services.AddScoped(sp => new HttpClient
{
    BaseAddress = new Uri(builder.HostEnvironment.BaseAddress)
});

var adminApiBase   = builder.Configuration["ApiBaseUrl:EcmisAdmin"]
    ?? builder.Configuration["ApiBaseUrl:AdminService"] // backward compatibility
    ?? "http://localhost:5001/";
var complainApiBase = builder.Configuration["ApiBaseUrl:EcmisComplain"] ?? "http://localhost:5002/";
var shareApiBase    = builder.Configuration["ApiBaseUrl:EcmisShare"]    ?? "http://localhost:5003/";

// HttpClient สำหรับ ecmis-complaint API
builder.Services.AddScoped(sp => new ComplaintApiService(new HttpClient
{
    BaseAddress = new Uri(complainApiBase)
}));
// ecmis-admin API — shared HttpClient with session refresh + 401 → /login
builder.Services.AddScoped<AuthRedirectService>();
builder.Services.AddScoped<AuthHttpMessageHandler>();
builder.Services.AddScoped(sp =>
{
    var handler = sp.GetRequiredService<AuthHttpMessageHandler>();
    handler.InnerHandler = new HttpClientHandler();
    return new HttpClient(handler) { BaseAddress = new Uri(adminApiBase) };
});
builder.Services.AddScoped<UserApiService>();
builder.Services.AddScoped<OrgApiService>();
builder.Services.AddScoped<AuthApiService>();
builder.Services.AddScoped<AdminApiService>();
builder.Services.AddScoped<CentralSupportApiService>();
builder.Services.AddScoped<SystemAccessApiService>();
builder.Services.AddScoped<CurrentUserService>();

// Auth & ThaiD
builder.Services.AddScoped<ThaiDService>();
builder.Services.AddScoped<SessionService>();
builder.Services.AddScoped<PublicRelationsService>();

// Activity 4 Services
builder.Services.AddScoped<IntakeFormService>();
builder.Services.AddScoped<DocumentSplitService>();
builder.Services.AddScoped<SLATrackingService>();
builder.Services.AddScoped<CaseRoutingService>();
builder.Services.AddScoped<ExportService>();

// Registration Service
builder.Services.AddScoped<RegistrationService>();

// TOBE 14.4.5 — API Data Publishing
builder.Services.AddScoped<ApiKeyApiService>();

// TOR 12.2 — complaint statistics (seed now; swap to ApiComplaintStatsService later)
builder.Services.AddScoped<EcmisWeb.Services.IComplaintStatsService,
                           EcmisWeb.Services.SeedComplaintStatsService>();
builder.Services.AddScoped<EcmisWeb.Services.IDirectorReportService,
                           EcmisWeb.Services.SeedDirectorReportService>();

var host = builder.Build();

// Start waking the complaint API as soon as the Blazor app boots, before the
// user opens the complaint pages. This still displays only real API data.
_ = host.Services.GetRequiredService<ComplaintApiService>().WarmupComplaintsAsync();

await host.RunAsync();
