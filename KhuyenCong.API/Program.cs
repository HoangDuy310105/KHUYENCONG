using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure Entity Framework Core with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<KhuyenCong.Data.Context.KhuyenCongDbContext>(options =>
    options.UseNpgsql(connectionString));

// Configure CORS for Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

// Configure AutoMapper
builder.Services.AddAutoMapper(cfg => 
{
    cfg.AddProfile<KhuyenCong.Service.Mappings.MappingProfile>();
});

// Register Repository & UnitOfWork
builder.Services.AddScoped(typeof(KhuyenCong.Core.Interfaces.IRepository<>), typeof(KhuyenCong.Data.Repositories.Repository<>));
builder.Services.AddScoped<KhuyenCong.Core.Interfaces.IUnitOfWork, KhuyenCong.Data.Repositories.UnitOfWork>();

// Đăng ký Redis Cache
// Kết nối tới Redis theo cấu hình trong appsettings.json
var redisConnection = builder.Configuration.GetConnectionString("RedisConnection") ?? "localhost:6379";
builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConnection));
builder.Services.AddSingleton<KhuyenCong.Service.Interfaces.ICacheService, KhuyenCong.Service.Implementations.RedisCacheService>();

// Master Data Services
builder.Services.AddHttpClient();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.ILinhVucService, KhuyenCong.Service.Implementations.LinhVucService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.IDonViService, KhuyenCong.Service.Implementations.DonViService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.ILoaiDeAnService, KhuyenCong.Service.Implementations.LoaiDeAnService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.IDiaDiemService, KhuyenCong.Service.Implementations.DiaDiemService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.INguoiDungService, KhuyenCong.Service.Implementations.NguoiDungService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.IAuthService, KhuyenCong.Service.Implementations.AuthService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings.GetValue<string>("SecretKey") ?? "Day_La_Mot_Khoa_Bi_Mat_Ruyet_Doi_Dai_32_Ky_Tu";
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidateAudience = true,
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");

app.UseAuthentication(); // Bắt buộc phải đứng trước UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();
