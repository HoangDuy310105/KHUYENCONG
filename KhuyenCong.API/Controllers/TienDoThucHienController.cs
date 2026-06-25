using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TienDoThucHienController : ControllerBase
{
    private readonly ITienDoThucHienService _tienDoService;
    private readonly IDeAnService _deAnService;

    public TienDoThucHienController(ITienDoThucHienService tienDoService, IDeAnService deAnService)
    {
        _tienDoService = tienDoService;
        _deAnService = deAnService;
    }

    private Guid? GetUserDonViId()
    {
        var donViIdClaim = User.FindFirst("DonViId")?.Value;
        if (!string.IsNullOrEmpty(donViIdClaim) && Guid.TryParse(donViIdClaim, out var parsed)) return parsed;
        return null;
    }

    private bool IsCoSoRole()
    {
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        return role == "Role_CoSo" || role == "1";
    }

    [HttpGet("dean/{deAnId}")]
    public async Task<IActionResult> GetByDeAn(Guid deAnId)
    {
        // BUG-10 FIX: Kiểm tra IDOR khi xem báo cáo
        if (IsCoSoRole())
        {
            var userDonViId = GetUserDonViId();
            var deAn = await _deAnService.GetByIdAsync(deAnId);
            if (deAn == null) return NotFound(new { Message = "Đề án không tồn tại." });
            if (userDonViId == null || deAn.DonViThuHuongId != userDonViId)
                return Forbid(); // Không được xem báo cáo của đơn vị khác
        }

        var result = await _tienDoService.GetByDeAnIdAsync(deAnId);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Role_CoSo,Role_TTKC,Role_Admin")]
    public async Task<IActionResult> Create([FromBody] TienDoThucHienDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        try
        {
            var deAn = await _deAnService.GetByIdAsync(dto.DeAnId);
            if (deAn == null) return NotFound(new { Message = "Đề án không tồn tại." });

            if (IsCoSoRole())
            {
                var userDonViId = GetUserDonViId();
                if (userDonViId == null || deAn.DonViThuHuongId != userDonViId)
                    return Forbid(); // Không được nộp báo cáo cho đề án của đơn vị khác
            }

            if (deAn.TrangThai != 6) // 6 = DangThucHien
            {
                return BadRequest(new { Message = "Chỉ được phép báo cáo tiến độ khi Đề án đang ở trạng thái Đang thực hiện." });
            }

            var result = await _tienDoService.CreateAsync(dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    private Guid? GetUserId()
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdString, out var userId)) return userId;
        return null;
    }

    [HttpPut("{id}/kiem-tra")]
    [Authorize(Roles = "Role_So,Role_TTKC,Role_Admin")]
    public async Task<IActionResult> KiemTraThucDia(Guid id, [FromBody] KiemTraTienDoRequest request)
    {
        try
        {
            var result = await _tienDoService.KiemTraThucDiaAsync(id, request.PhanTramThucTe, request.BienBanKiemTraUrl);
            if (!result) return NotFound(new { Message = "Không tìm thấy báo cáo tiến độ." });
            return Ok(new { Message = "Đã cập nhật kết quả kiểm tra thực địa." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("{id}/duyet")]
    [Authorize(Roles = "Role_So,Role_Admin")]
    public async Task<IActionResult> DuyetBaoCao(Guid id, [FromBody] DuyetTienDoRequest request)
    {
        try
        {
            var result = await _tienDoService.DuyetBaoCaoAsync(id, request.IsApproved, request.LyDoTuChoi, GetUserId());
            if (!result) return NotFound(new { Message = "Không tìm thấy báo cáo tiến độ." });
            return Ok(new { Message = request.IsApproved ? "Đã phê duyệt báo cáo tiến độ." : "Đã yêu cầu bổ sung báo cáo." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}

public class KiemTraTienDoRequest
{
    public int PhanTramThucTe { get; set; }
    public string? BienBanKiemTraUrl { get; set; }
}

public class DuyetTienDoRequest
{
    public bool IsApproved { get; set; }
    public string? LyDoTuChoi { get; set; }
}
