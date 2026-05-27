using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using System;
using System.Threading.Tasks;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DeAnController : ControllerBase
{
    private readonly IDeAnService _deAnService;

    public DeAnController(IDeAnService deAnService)
    {
        _deAnService = deAnService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] Guid? linhVucId = null, [FromQuery] int? trangThai = null)
    {
        var userRoleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var donViIdClaim = User.FindFirst("DonViId")?.Value;

        Guid? userDonViId = null;
        if (!string.IsNullOrEmpty(donViIdClaim) && Guid.TryParse(donViIdClaim, out var parsedDonViId))
        {
            userDonViId = parsedDonViId;
        }

        var (items, totalCount) = await _deAnService.GetPagedAsync(page, pageSize, search, linhVucId, trangThai, userDonViId, userRoleClaim);
        return Ok(new { Items = items, TotalCount = totalCount });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _deAnService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Role_CoSo,Role_So,Role_Admin,Role_TTKC")] // Role_CoSo, Role_So, Admin, TTKC
    public async Task<IActionResult> Create([FromBody] DeAnDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _deAnService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Role_CoSo,Role_So,Role_Admin,Role_TTKC")]
    public async Task<IActionResult> Update(Guid id, [FromBody] DeAnDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var updated = await _deAnService.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Role_CoSo,Role_Admin,Role_TTKC")] // Cấp cơ sở tạo nháp, TTKC hỗ trợ hoặc Admin mới được xóa
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _deAnService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{id}/nop")]
    [Authorize(Roles = "Role_CoSo,Role_Admin,Role_TTKC")]
    public async Task<IActionResult> NopHoSo(Guid id)
    {
        // Trạng thái 1 = Chờ Sở duyệt
        var updated = await _deAnService.UpdateStatusAsync(id, 1, "Nộp hồ sơ");
        if (!updated) return NotFound();
        return Ok(new { Message = "Đã nộp hồ sơ thành công" });
    }

    [HttpPost("{id}/duyet")]
    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin")]
    public async Task<IActionResult> DuyetHoSo(Guid id, [FromQuery] int currentTrangThai)
    {
        var userRoleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        bool isAdmin = userRoleClaim == "Role_Admin";

        int nextState;
        switch (currentTrangThai)
        {
            case 1: 
                if (userRoleClaim != "Role_So" && !isAdmin)
                    return Forbid("Chỉ Sở Công Thương mới có quyền duyệt hồ sơ cấp cơ sở.");
                nextState = 2; // Chờ Cục thẩm định
                break;
            case 2: 
                if (userRoleClaim != "Role_Bo" && !isAdmin)
                    return Forbid("Chỉ Cục Công Thương mới có quyền phê duyệt đề án.");
                nextState = 5; // Đã phê duyệt
                break;
            case 5: 
                nextState = 6; // Đang thực hiện
                break;
            default: 
                return BadRequest("Trạng thái hiện tại không hợp lệ để duyệt.");
        }
        
        var updated = await _deAnService.UpdateStatusAsync(id, nextState, "Đã duyệt hồ sơ");
        if (!updated) return NotFound();
        return Ok(new { Message = "Đã duyệt hồ sơ thành công" });
    }

    [HttpPost("{id}/tra-ve")]
    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin")]
    public async Task<IActionResult> TraHoSo(Guid id, [FromBody] string lyDo)
    {
        if (string.IsNullOrWhiteSpace(lyDo))
            return BadRequest(new { Message = "Bắt buộc phải nhập lý do yêu cầu bổ sung." });

        // Trạng thái 3 = Yêu cầu bổ sung
        var updated = await _deAnService.UpdateStatusAsync(id, 3, lyDo);
        if (!updated) return NotFound();
        return Ok(new { Message = "Đã trả lại hồ sơ yêu cầu bổ sung" });
    }

    [HttpPost("{id}/tu-choi")]
    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin")]
    public async Task<IActionResult> TuChoi(Guid id, [FromBody] string lyDo)
    {
        if (string.IsNullOrWhiteSpace(lyDo))
            return BadRequest(new { Message = "Bắt buộc phải nhập lý do từ chối." });

        // Trạng thái 4 = Bị từ chối
        var updated = await _deAnService.UpdateStatusAsync(id, 4, lyDo);
        if (!updated) return NotFound();
        return Ok(new { Message = "Đã từ chối hồ sơ." });
    }

    [HttpPost("{id}/nghiem-thu")]
    [Authorize(Roles = "Role_So,Role_Admin")]
    public async Task<IActionResult> NghiemThu(Guid id, [FromBody] string fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            return BadRequest(new { Message = "Bắt buộc phải đính kèm file Biên bản nghiệm thu." });

        // Trạng thái 7 = Đã nghiệm thu
        var updated = await _deAnService.UpdateStatusAsync(id, 7, "Đã nghiệm thu. File đính kèm: " + fileUrl);
        if (!updated) return NotFound();
        return Ok(new { Message = "Đã nghiệm thu đề án thành công." });
    }
}
