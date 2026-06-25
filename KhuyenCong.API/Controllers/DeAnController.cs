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

    private Guid? GetUserId()
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdString, out var userId)) return userId;
        return null;
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

        // Kiểm tra IDOR: Cơ sở chỉ được xem đề án của chính mình
        if (IsCoSoRole())
        {
            var userDonViId = GetUserDonViId();
            if (userDonViId == null || result.DonViThuHuongId != userDonViId)
                return Forbid();
        }

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Role_CoSo,Role_So,Role_Admin,Role_TTKC")] // Role_CoSo, Role_So, Admin, TTKC
    public async Task<IActionResult> Create([FromBody] DeAnDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try 
        {
            var result = await _deAnService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Role_CoSo,Role_So,Role_Admin,Role_TTKC")]
    public async Task<IActionResult> Update(Guid id, [FromBody] DeAnDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // BUG-02 FIX: Kiểm tra chủ sở hữu nếu là Role_CoSo
        if (IsCoSoRole())
        {
            var existing = await _deAnService.GetByIdAsync(id);
            if (existing == null) return NotFound();
            var userDonViId = GetUserDonViId();
            if (userDonViId == null || existing.DonViThuHuongId != userDonViId)
                return Forbid(); // Không phải đề án của cơ sở này
        }

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
        // BUG-02 FIX: Kiểm tra chủ sở hữu nếu là Role_CoSo
        if (IsCoSoRole())
        {
            var existing = await _deAnService.GetByIdAsync(id);
            if (existing == null) return NotFound();
            var userDonViId = GetUserDonViId();
            if (userDonViId == null || existing.DonViThuHuongId != userDonViId)
                return Forbid(); // Không phải đề án của cơ sở này
        }

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
        var existing = await _deAnService.GetByIdAsync(id);
        if (existing == null) return NotFound();

        // BUG-02 FIX: Kiểm tra chủ sở hữu nếu là Role_CoSo (Ngăn chặn IDOR)
        if (IsCoSoRole())
        {
            var userDonViId = GetUserDonViId();
            if (userDonViId == null || existing.DonViThuHuongId != userDonViId)
                return Forbid(); // Không phải đề án của cơ sở này
        }

        if (existing.TrangThai != 0 && existing.TrangThai != 3)
        {
            return BadRequest(new { Message = "Chỉ có thể nộp Đề án khi đang ở trạng thái Bản Nháp hoặc Yêu cầu bổ sung." });
        }

        try 
        {
            // Trạng thái 1 = Chờ Sở duyệt
            var updated = await _deAnService.UpdateStatusAsync(id, 1, "Nộp hồ sơ", GetUserId());
            if (!updated) return NotFound();

            var today = DateTime.UtcNow.AddHours(7);
            if (today.Month > 5 || (today.Month == 5 && today.Day > 20))
            {
                return Ok(new { Message = $"⚠️ Đã nộp hồ sơ thành công (Chế độ Demo). Lưu ý: Thực tế đã quá hạn nộp hồ sơ (20/05/{today.Year})." });
            }

            return Ok(new { Message = "Đã nộp hồ sơ thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{id}/duyet")]
    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin")]
    public async Task<IActionResult> DuyetHoSo(Guid id, [FromQuery] int currentTrangThai)
    {
        var userRoleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        bool isAdmin = userRoleClaim == "Role_Admin";

        try
        {
            var deAn = await _deAnService.GetByIdAsync(id);
            if (deAn == null) return NotFound();

            int targetStatus;
            string message;

            if (currentTrangThai == 1) // Sở duyệt
            {
                if (deAn.NguonKinhPhi == (int)KhuyenCong.Core.Enums.NguonKinhPhi.DiaPhuong)
                {
                    // M05: Đề án địa phương -> Sở duyệt xong thì chuyển 9 (Chờ Tỉnh Phê Duyệt), bỏ qua bước Cục
                    targetStatus = 9; 
                    message = "Sở đã duyệt (Đề án Địa phương) - Chờ UBND Tỉnh phê duyệt";
                }
                else 
                {
                    // Đề án quốc gia -> Sở duyệt xong chuyển 2 (Chờ Cục thẩm định)
                    targetStatus = 2;
                    message = "Sở đã thẩm định - Chờ Cục thẩm định";
                }
            }
            else if (currentTrangThai == 2) // Cục duyệt
            {
                if (deAn.NguonKinhPhi == (int)KhuyenCong.Core.Enums.NguonKinhPhi.DiaPhuong)
                {
                    return BadRequest(new { Message = "Luồng Đề án Địa phương không yêu cầu Cục duyệt." });
                }
                targetStatus = 5; // Cục duyệt xong thì Phê duyệt KH (5)
                message = "Cục đã phê duyệt";
            }
            else if (currentTrangThai == 7) // Quyết toán
            {
                targetStatus = 8; // Chuyển sang Đã Quyết Toán
                message = "Đã quyết toán và đóng dự án";
            }
            else
            {
                return BadRequest(new { Message = "Trạng thái hiện tại không hợp lệ để duyệt." });
            }

            var updated = await _deAnService.UpdateStatusAsync(id, targetStatus, message, GetUserId());
            if (!updated) return NotFound();

            return Ok(new { Message = "Đã duyệt hồ sơ" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{id}/phe-duyet-dia-phuong")]
    [Authorize(Roles = "Role_So,Role_Admin")]
    public async Task<IActionResult> PheDuyetDiaPhuong(Guid id, [FromBody] string fileUrl)
    {
        try
        {
            if (string.IsNullOrEmpty(fileUrl))
                return BadRequest(new { Message = "Yêu cầu cung cấp đường dẫn file Quyết định phê duyệt." });

            var deAn = await _deAnService.GetByIdAsync(id);
            if (deAn == null) return NotFound();

            if (deAn.NguonKinhPhi != (int)KhuyenCong.Core.Enums.NguonKinhPhi.DiaPhuong)
            {
                return BadRequest(new { Message = "Đây không phải là Đề án Địa phương." });
            }

            if (deAn.TrangThai != 9)
            {
                return BadRequest(new { Message = "Đề án chưa ở trạng thái Chờ UBND Tỉnh phê duyệt." });
            }

            // Cập nhật lên trạng thái 5 (Đã Phê duyệt KH)
            var updated = await _deAnService.UpdateStatusAsync(id, 5, $"UBND Tỉnh đã phê duyệt. File QĐ: {fileUrl}", GetUserId());
            if (!updated) return NotFound();

            return Ok(new { Message = "Cập nhật Quyết định Phê duyệt thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{id}/tra-ve")]
    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin")]
    public async Task<IActionResult> TraHoSo(Guid id, [FromBody] TraHoSoRequest request)
    {
        try
        {
            var existing = await _deAnService.GetByIdAsync(id);
            if (existing == null) return NotFound();
            if (existing.TrangThai != 1 && existing.TrangThai != 2)
                return BadRequest(new { Message = "Chỉ có thể trả hồ sơ khi đang chờ thẩm định." });

            if (string.IsNullOrEmpty(request.LyDo))
                return BadRequest(new { Message = "Lý do không được để trống" });

            // 3: Yêu cầu bổ sung
            string message = $"Yêu cầu bổ sung: {request.LyDo}";
            if (!string.IsNullOrEmpty(request.FileUrl))
            {
                message += $" | File đính kèm: {request.FileUrl}";
            }

            var updated = await _deAnService.UpdateStatusAsync(id, 3, message, GetUserId());
            if (!updated) return NotFound();

            return Ok(new { Message = "Đã trả hồ sơ để yêu cầu bổ sung" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{id}/tu-choi")]
    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin")]
    public async Task<IActionResult> TuChoi(Guid id, [FromBody] string lyDo)
    {
        try
        {
            var existing = await _deAnService.GetByIdAsync(id);
            if (existing == null) return NotFound();
            if (existing.TrangThai != 1 && existing.TrangThai != 2)
                return BadRequest(new { Message = "Chỉ có thể từ chối đề án khi đang chờ thẩm định." });

            if (string.IsNullOrEmpty(lyDo))
                return BadRequest("Lý do không được để trống");

            // 4: Bị Từ chối
            var updated = await _deAnService.UpdateStatusAsync(id, 4, $"Bị từ chối: {lyDo}", GetUserId());
            if (!updated) return NotFound();

            return Ok(new { Message = "Đã từ chối đề án" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{id}/nghiem-thu")]
    // RBAC-02 FIX: Theo tài liệu QLNN Bước 9 và State Machine (Tuần 1, mục 1.4.3 dòng 10):
    // "Nghiệm thu: Tác nhân = Cán bộ Sở CT" — Sở cóng thương kiểm tra kết quả và thực hiện nghiệm thu.
    // Xoá Role_CoSo vì cơ sở không tự nghiệm thu được dự án của mình.
    // TTKC giữ lại vì họ hỗ trợ điều phối và có thể dự nghiệm thu cùng Sở.
    [Authorize(Roles = "Role_So,Role_TTKC,Role_Admin")]
    public async Task<IActionResult> NghiemThu(Guid id, [FromBody] string fileUrl)
    {
        if (string.IsNullOrWhiteSpace(fileUrl))
            return BadRequest(new { Message = "Bắt buộc phải đính kèm file Biên bản nghiệm thu có đủ chữ ký các bên." });

        try
        {
            var existing = await _deAnService.GetByIdAsync(id);
            if (existing == null) return NotFound();
            if (existing.TrangThai != 6) // 6 = DangThucHien
                return BadRequest(new { Message = "Đề án phải ở trạng thái Đang thực hiện thì mới được nghiệm thu." });

            // Truyền thẳng fileUrl vào ghiChu để DeAnService nhận dạng
            // và lưu vào BienBanNghiemThu JSONB (MISSING-03 FIX trong DeAnService)
            var updated = await _deAnService.UpdateStatusAsync(id, 7, fileUrl, GetUserId());
            if (!updated) return NotFound();
            return Ok(new { Message = "Đã nghiệm thu đề án thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{id}/ky-hop-dong")]
    [Authorize(Roles = "Role_TTKC,Role_So,Role_Bo,Role_Admin")]
    public async Task<IActionResult> KyHopDong(Guid id, [FromBody] string fileUrl)
    {
        try
        {
            var existing = await _deAnService.GetByIdAsync(id);
            if (existing == null) return NotFound();
            if (existing.TrangThai != 5) // 5 = DaPheDuyet
                return BadRequest(new { Message = "Chỉ có thể ký hợp đồng cho đề án đã được phê duyệt." });

            if (string.IsNullOrEmpty(fileUrl))
                return BadRequest(new { Message = "Yêu cầu cung cấp đường dẫn file hợp đồng." });

            // 6: Đang Thực hiện (Sau khi ký HĐ)
            var updated = await _deAnService.UpdateStatusAsync(id, 6, $"Đã ký hợp đồng. File: {fileUrl}", GetUserId());
            if (!updated) return NotFound();

            return Ok(new { Message = "Đã cập nhật trạng thái Ký hợp đồng" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost("{id}/quyet-toan")]
    [Authorize(Roles = "Role_Admin,Role_Bo,Role_So")]
    public async Task<IActionResult> QuyetToan(Guid id)
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized(new { message = "Không xác định được người dùng" });
        }

        var userRoleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        // BUG-07 FIX: Chặn quyết toán 2 lần
        var deAn = await _deAnService.GetByIdAsync(id);
        if (deAn == null) return NotFound(new { message = "Không tìm thấy Đề án" });
        if (deAn.TrangThai == 8)
            return BadRequest(new { message = "Đề án này đã được quyết toán rồi." });

        // LỖ HỔNG 4 FIX: Phân quyền Quyết toán theo Nguồn kinh phí
        if (userRoleClaim == "Role_So" && deAn.NguonKinhPhi != (int)KhuyenCong.Core.Enums.NguonKinhPhi.DiaPhuong)
        {
            return StatusCode(403, new { message = "Sở Công Thương chỉ được phép quyết toán Đề án địa phương." });
        }
        if (userRoleClaim == "Role_Bo" && deAn.NguonKinhPhi == (int)KhuyenCong.Core.Enums.NguonKinhPhi.DiaPhuong)
        {
            return StatusCode(403, new { message = "Bộ/Cục Công Thương không có thẩm quyền quyết toán Đề án địa phương." });
        }

        try 
        {
            var result = await _deAnService.QuyetToanAsync(id, userId);
            if (!result) return NotFound(new { message = "Không tìm thấy Đề án hoặc lỗi khi quyết toán" });
            return Ok(new { message = "Quyết toán thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
