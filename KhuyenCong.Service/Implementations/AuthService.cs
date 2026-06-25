using KhuyenCong.Core.Interfaces;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace KhuyenCong.Service.Implementations;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly AutoMapper.IMapper _mapper;

    public AuthService(IUnitOfWork unitOfWork, IConfiguration configuration, AutoMapper.IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _mapper = mapper;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        // 1. Tìm User trong DB
        var users = await _unitOfWork.NguoiDungs.FindAsync(u => u.Username == request.Username);
        var user = users.FirstOrDefault();

        if (user == null)
        {
            return new LoginResponseDto { Success = false, Message = "Tài khoản không tồn tại." };
        }

        if (!user.IsActive)
        {
            return new LoginResponseDto { Success = false, Message = "Tài khoản của bạn đang chờ Ban quản trị phê duyệt trong vòng 24h. Vui lòng quay lại sau." };
        }

        // 2. Kiểm tra mật khẩu bằng BCrypt
        bool isPasswordValid = false;
        
        if (!string.IsNullOrEmpty(request.Password) && !string.IsNullOrEmpty(user.PasswordHash))
        {
            try 
            {
                isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            }
            catch (BCrypt.Net.SaltParseException) 
            {
                isPasswordValid = false;
            }
        }
        
        if (!isPasswordValid)
        {
            return new LoginResponseDto { Success = false, Message = "Mật khẩu không chính xác." };
        }

        string? tenDonVi = null;
        if (user.DonViId.HasValue)
        {
            var donVi = await _unitOfWork.DonVis.GetByIdAsync(user.DonViId.Value);
            tenDonVi = donVi?.TenDonVi;
        }

        // 3. Khởi tạo Token
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:SecretKey"] ?? "Day_La_Mot_Khoa_Bi_Mat_Ruyet_Doi_Dai_32_Ky_Tu");
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("DonViId", user.DonViId?.ToString() ?? string.Empty)
            }),
            Expires = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["JwtSettings:ExpiryMinutes"] ?? "60")),
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return new LoginResponseDto
        {
            Success = true,
            Message = "Đăng nhập thành công",
            Token = tokenHandler.WriteToken(token),
            Username = user.Username,
            Role = (int)user.Role,
            DonViId = user.DonViId,
            TenDonVi = tenDonVi
        };
    }

    public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // 1. Kiểm tra Username tồn tại
        var existingUsers = await _unitOfWork.NguoiDungs.FindAsync(u => u.Username == request.Username);
        if (existingUsers.Any())
        {
            return new LoginResponseDto { Success = false, Message = "Tên đăng nhập đã tồn tại trên hệ thống." };
        }

        // 2. Kiểm tra Mã số thuế tồn tại
        var existingDonVis = await _unitOfWork.DonVis.FindAsync(d => d.MaSoThue == request.MaSoThue);
        if (existingDonVis.Any())
        {
            return new LoginResponseDto { Success = false, Message = "Mã số thuế đã tồn tại trên hệ thống." };
        }

        // 3. Tạo Đơn vị mới
        var rand = new Random();
        var donVi = new KhuyenCong.Core.Entities.DonVi
        {
            Id = Guid.NewGuid(),
            TenDonVi = request.TenDonVi,
            MaSoThue = request.MaSoThue,
            DiaChi = request.DiaChi,
            LoaiDonVi = (KhuyenCong.Core.Enums.LoaiDonVi)request.LoaiDonVi,
            QuyMo = "DNNVV",
            ViDo = request.ViDo,
            KinhDo = request.KinhDo,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Nếu Frontend không lấy được tọa độ, Backend sẽ tự gọi Geocoding với cơ chế Fallback
        if (donVi.ViDo == null || donVi.KinhDo == null)
        {
            var coords = await KhuyenCong.Service.Helpers.GeocodingHelper.GetCoordinatesAsync(donVi.DiaChi);
            if (coords.lat != null && coords.lon != null)
            {
                donVi.ViDo = coords.lat;
                donVi.KinhDo = coords.lon;
            }
            else
            {
                // Fallback nếu API sập: Random Bến Tre
                donVi.ViDo = 10.1 + (rand.NextDouble() * 0.3);
                donVi.KinhDo = 106.2 + (rand.NextDouble() * 0.4);
            }
        }
        await _unitOfWork.DonVis.AddAsync(donVi);

        // 4. Tạo Người dùng mới (mã hóa mật khẩu bằng BCrypt)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = new KhuyenCong.Core.Entities.NguoiDung
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            PasswordHash = passwordHash,
            Role = KhuyenCong.Core.Enums.RoleType.Role_CoSo,
            DonViId = donVi.Id,
            IsActive = false, // Chờ duyệt tài khoản (mặc định chưa kích hoạt)
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _unitOfWork.NguoiDungs.AddAsync(user);

        // 5. Lưu xuống Database
        await _unitOfWork.CompleteAsync();

        return new LoginResponseDto
        {
            Success = true,
            Message = "Đăng ký thành công! Tài khoản của bạn đang được Ban quản trị xem xét phê duyệt trong vòng 24h. Vui lòng quay lại đăng nhập sau."
        };
    }

    public async Task<NguoiDungDto?> GetProfileAsync(Guid userId)
    {
        var user = await _unitOfWork.NguoiDungs.GetByIdAsync(userId);
        if (user == null) return null;
        return _mapper.Map<NguoiDungDto>(user);
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, DoiMatKhauDto request)
    {
        var user = await _unitOfWork.NguoiDungs.GetByIdAsync(userId);
        if (user == null) return false;

        bool isOldPasswordValid = (user.PasswordHash == request.MatKhauCu) || 
                               (request.MatKhauCu != null && request.MatKhauCu.Length > 0 && BCrypt.Net.BCrypt.Verify(request.MatKhauCu, user.PasswordHash));
                               
        if (!isOldPasswordValid) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.MatKhauMoi);
        _unitOfWork.NguoiDungs.Update(user);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
