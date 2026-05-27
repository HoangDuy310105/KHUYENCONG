using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest(new { Message = "Tên đăng nhập và mật khẩu không được để trống." });
        }

        var response = await _authService.LoginAsync(request);

        if (!response.Success)
        {
            return Unauthorized(new { Message = response.Message });
        }

        return Ok(response);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var response = await _authService.RegisterAsync(request);

        if (!response.Success)
        {
            return BadRequest(new { Message = response.Message });
        }

        return Ok(response);
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !System.Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized(new { Message = "Token không hợp lệ." });
        }

        var profile = await _authService.GetProfileAsync(userId);
        if (profile == null) return NotFound(new { Message = "Không tìm thấy người dùng." });

        return Ok(profile);
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPost("doi-mat-khau")]
    public async Task<IActionResult> ChangePassword([FromBody] DoiMatKhauDto request)
    {
        if (string.IsNullOrEmpty(request.MatKhauCu) || string.IsNullOrEmpty(request.MatKhauMoi))
        {
            return BadRequest(new { Message = "Mật khẩu không được để trống." });
        }

        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !System.Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized(new { Message = "Token không hợp lệ." });
        }

        var success = await _authService.ChangePasswordAsync(userId, request);
        if (!success)
        {
            return BadRequest(new { Message = "Mật khẩu cũ không chính xác." });
        }

        return Ok(new { Message = "Đổi mật khẩu thành công." });
    }
}
