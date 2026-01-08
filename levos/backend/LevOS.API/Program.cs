using LevOS.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register application services
builder.Services.AddScoped<IAutoBlockService, AutoBlockService>();
builder.Services.AddScoped<IScenarioService, ScenarioService>();

// CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:3000",
            "https://levos2.web.app",
            "https://levos2.firebaseapp.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", () => new
{
    Status = "healthy",
    Version = "1.0.0",
    Timestamp = DateTime.UtcNow
}).WithName("HealthCheck").WithOpenApi();

app.Run();
