using Microsoft.EntityFrameworkCore;
using MonitorRTC.Data;
using MonitorRTC.WebHub;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddServerSideBlazor();
builder.Services.AddSignalR();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHttpClient();
builder.Services.AddHttpContextAccessor();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Set session timeout
});

builder.WebHost.UseKestrel(options =>
{
    options.Listen(System.Net.IPAddress.Any, 443, listenOptions =>
    {
        listenOptions.UseHttps("C:\\Users\\Abdullah Ashraf\\source\\repos\\MonitorRTC\\MonitorRTC\\lastcert\\monitortc.com.pfx", "%%%%%$$$$$0y1d1o2o3b11A$$$$$%%%%%");
    });
    options.Listen(System.Net.IPAddress.Any, 80, listenOptions =>
    {
        listenOptions.UseHttps("C:\\Users\\Abdullah Ashraf\\source\\repos\\MonitorRTC\\MonitorRTC\\lastcert\\monitortc.com.pfx", "%%%%%$$$$$0y1d1o2o3b11A$$$$$%%%%%");
    });
    });
var app = builder.Build();

// Serve static files from wwwroot with no-cache headers
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var fileExtension = Path.GetExtension(ctx.File.PhysicalPath).ToLower();
        // Disable cache for JS, CSS, and other static files
        if (fileExtension == ".js" || fileExtension == ".css" || fileExtension == ".html")
        {
            ctx.Context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate";
            ctx.Context.Response.Headers["Pragma"] = "no-cache";
            ctx.Context.Response.Headers["Expires"] = "0";
        }
    }
});

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

// Add cache control headers for all responses
app.Use(async (context, next) =>
{
    context.Response.Headers["Expires"] = "0";
    context.Response.Headers["Pragma"] = "no-cache";
    context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, proxy-revalidate";

    await next();
});

app.UseSession();
app.UseWebSockets();

app.Use(async (context, next) =>
{
    context.Session.Clear();
    await next();
});

app.MapBlazorHub();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.UseSession();
app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<WebRTCHub>("/webrtc");
});
app.Run();
//https://monitortc.com:443;http://monitortc.com:80
