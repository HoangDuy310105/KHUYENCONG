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
        // Tùy theo trạng thái hiện tại để đẩy sang trạng thái tiếp theo của 9 trạng thái:
        // 1: Chờ Sở thẩm định -> 2: Chờ Cục thẩm định
        // 2: Chờ Cục thẩm định -> 5: Đã phê duyệt
        // 5: Đã phê duyệt -> 6: Đang thực hiện
        // 6: Đang thực hiện -> 7: Đã nghiệm thu
        // 7: Đã nghiệm thu -> 8: Đã quyết toán
        int nextState;
        switch (currentTrangThai)
        {
            case 1: nextState = 2; break;
            case 2: nextState = 5; break;
            case 5: nextState = 6; break;
            case 6: nextState = 7; break;
            case 7: nextState = 8; break;
            default: nextState = currentTrangThai + 1; break;
        }
        
        var updated = await _deAnService.UpdateStatusAsync(id, nextState, "Đã duyệt hồ sơ");
        if (!updated) return NotFound();
        return Ok(new { Message = "Đã duyệt hồ sơ thành công" });
    }

    [HttpPost("{id}/tra-ve")]
    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin")]
    public async Task<IActionResult> TraHoSo(Guid id, [FromBody] string lyDo)
    {
        // Trạng thái 3 = Yêu cầu bổ sung
        var updated = await _deAnService.UpdateStatusAsync(id, 3, lyDo);
        if (!updated) return NotFound();
        return Ok(new { Message = "Đã trả lại hồ sơ yêu cầu bổ sung" });
    }
}
