using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using StackExchange.Redis;
using Minio;
using KhuyenCong.Service.Interfaces;
using KhuyenCong.Service.Implementations;

// ⚠️ Cho phép Npgsql tự convert DateTime.Kind=Unspecified thành UTC
// để tránh lỗi "Cannot write DateTime with Kind=Unspecified to PostgreSQL timestamp with time zone"
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure Entity Framework Core with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<KhuyenCong.Data.Context.KhuyenCongDbContext>(options =>
    options.UseNpgsql(connectionString)
           .ConfigureWarnings(warnings => warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

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
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.IDeAnService, KhuyenCong.Service.Implementations.DeAnService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.IGiaiNganService, KhuyenCong.Service.Implementations.GiaiNganService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.ISanPhamOcopService, KhuyenCong.Service.Implementations.SanPhamOcopService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.ITienDoThucHienService, KhuyenCong.Service.Implementations.TienDoThucHienService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.IChiTieuKPIService, KhuyenCong.Service.Implementations.ChiTieuKPIService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.IDashboardService, KhuyenCong.Service.Implementations.DashboardService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.IVanBanService, KhuyenCong.Service.Implementations.VanBanService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.ITinTucService, KhuyenCong.Service.Implementations.TinTucService>();
builder.Services.AddScoped<KhuyenCong.Service.Interfaces.ILichSuThaoTacService, KhuyenCong.Service.Implementations.LichSuThaoTacService>();

// Configure MinIO Storage
var minioEndpoint = builder.Configuration["MinioSettings:Endpoint"] ?? "localhost:9000";
var minioAccessKey = builder.Configuration["MinioSettings:AccessKey"] ?? "minioadmin";
var minioSecretKey = builder.Configuration["MinioSettings:SecretKey"] ?? "minioadmin123";

builder.Services.AddMinio(configureClient => configureClient
    .WithEndpoint(minioEndpoint)
    .WithCredentials(minioAccessKey, minioSecretKey)
    .WithSSL(false) // Không dùng HTTPS cho môi trường dev
    .Build());

builder.Services.AddScoped<IFileStorageService, MinioStorageService>();

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
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "KhuyenCong API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Nhập token JWT của bạn."
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Tự động chạy Migration và Seed dữ liệu khi khởi động
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<KhuyenCong.Data.Context.KhuyenCongDbContext>();
    dbContext.Database.Migrate();

    // Runtime seed dữ liệu nếu bảng trống
    if (!dbContext.LoaiDeAns.Any())
    {
        dbContext.LoaiDeAns.AddRange(new List<KhuyenCong.Core.Entities.LoaiDeAn>
        {
            new KhuyenCong.Core.Entities.LoaiDeAn { Id = Guid.NewGuid(), MaLoai = "KQG_DIEM", TenLoai = "Khuyến công Quốc gia (Điểm)" },
            new KhuyenCong.Core.Entities.LoaiDeAn { Id = Guid.NewGuid(), MaLoai = "KQG_NHOM", TenLoai = "Khuyến công Quốc gia (Theo nhóm)" },
            new KhuyenCong.Core.Entities.LoaiDeAn { Id = Guid.NewGuid(), MaLoai = "KQG_DOITUONG", TenLoai = "Khuyến công Quốc gia (Đối tượng cụ thể)" },
            new KhuyenCong.Core.Entities.LoaiDeAn { Id = Guid.NewGuid(), MaLoai = "KDP", TenLoai = "Khuyến công Địa phương" }
        });
        dbContext.SaveChanges();
    }

    if (dbContext.DonVis.Count() <= 1)
    {
        dbContext.DonVis.AddRange(new List<KhuyenCong.Core.Entities.DonVi>
        {
            new KhuyenCong.Core.Entities.DonVi 
            { 
                Id = Guid.NewGuid(), 
                TenDonVi = "Hợp tác xã Nông nghiệp Sạch Đồng Tháp", 
                MaSoThue = "1234567890", 
                LoaiDonVi = KhuyenCong.Core.Enums.LoaiDonVi.ThuHuong, 
                DiaChi = "Đồng Tháp" 
            },
            new KhuyenCong.Core.Entities.DonVi 
            { 
                Id = Guid.NewGuid(), 
                TenDonVi = "Công ty TNHH May mặc Bến Tre", 
                MaSoThue = "1234567891", 
                LoaiDonVi = KhuyenCong.Core.Enums.LoaiDonVi.ThuHuong, 
                DiaChi = "Bến Tre" 
            },
            new KhuyenCong.Core.Entities.DonVi 
            { 
                Id = Guid.NewGuid(), 
                TenDonVi = "Công ty Cổ phần VLXD Tiền Giang", 
                MaSoThue = "1234567892", 
                LoaiDonVi = KhuyenCong.Core.Enums.LoaiDonVi.ThuHuong, 
                DiaChi = "Tiền Giang" 
            },
            new KhuyenCong.Core.Entities.DonVi 
            { 
                Id = Guid.NewGuid(), 
                TenDonVi = "Công ty Cổ phần Thi công Xây dựng Hà Nội", 
                MaSoThue = "9876543210", 
                LoaiDonVi = KhuyenCong.Core.Enums.LoaiDonVi.ThiCong, 
                DiaChi = "Hà Nội" 
            },
            new KhuyenCong.Core.Entities.DonVi 
            { 
                Id = Guid.NewGuid(), 
                TenDonVi = "Công ty TNHH Cơ điện Miền Nam", 
                MaSoThue = "9876543211", 
                LoaiDonVi = KhuyenCong.Core.Enums.LoaiDonVi.ThiCong, 
                DiaChi = "TP. Hồ Chí Minh" 
            }
        });
        dbContext.SaveChanges();
    }
}

// Ensure wwwroot/uploads exists
var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
if (!Directory.Exists(uploadsFolder))
{
    Directory.CreateDirectory(uploadsFolder);
}
// Configure the HTTP request pipeline.
// Luôn mở Swagger để test API dễ dàng
app.MapOpenApi();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "KhuyenCong API V1");
});

if (!app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles(); // Phục vụ file tĩnh (upload tài liệu, ảnh)


app.UseCors("AllowAll");

app.UseAuthentication(); // Bắt buộc phải đứng trước UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();
