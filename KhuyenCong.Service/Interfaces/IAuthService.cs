using KhuyenCong.Service.DTOs;
using System.Threading.Tasks;

namespace KhuyenCong.Service.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<NguoiDungDto?> GetProfileAsync(System.Guid userId);
    Task<bool> ChangePasswordAsync(System.Guid userId, DoiMatKhauDto request);
}
