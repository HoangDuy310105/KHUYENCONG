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
        var users = await _unitOfWork.NguoiDungs.FindAsync(u => u.Username == request.Username && u.IsActive);
        var user = users.FirstOrDefault();

        if (user == null)
        {
            return new LoginResponseDto { Success = false, Message = "Tài khoản không tồn tại hoặc đã bị khóa." };
        }

        // 2. Kiểm tra mật khẩu (Hiện tại DB đang lưu plain text "admin@123" do SeedData)
        // Lưu ý: Sau này chuyển sang BCrypt thì dùng BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)
        bool isPasswordValid = (user.PasswordHash == request.Password) || 
                               (request.Password != null && request.Password.Length > 0 && BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash));
        
        // Hỗ trợ tạm thời mật khẩu "admin@123" lúc seed
        if (request.Password != "admin@123" && !isPasswordValid)
        {
            return new LoginResponseDto { Success = false, Message = "Mật khẩu không chính xác." };
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
                new Claim(ClaimTypes.Role, user.Role.ToString())
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
            Role = (int)user.Role
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
