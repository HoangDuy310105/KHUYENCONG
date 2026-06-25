using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using System;
using System.Threading.Tasks;
using OfficeOpenXml;
using System.IO;

namespace KhuyenCong.API.Controllers;

[Route("api/giai-ngan")]
[ApiController]
[Authorize]
public class GiaiNganController : ControllerBase
{
    private readonly IGiaiNganService _giaiNganService;
    private readonly IDeAnService _deAnService;

    public GiaiNganController(IGiaiNganService giaiNganService, IDeAnService deAnService)
    {
        _giaiNganService = giaiNganService;
        _deAnService = deAnService;
    }

    private Guid? GetUserId()
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdString, out var userId)) return userId;
        return null;
    }

    /// <summary>
    /// Lấy danh sách tất cả đề án kèm tóm tắt thông tin giải ngân (cho trang Kinh phí & Quyết toán)
    /// </summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var userRoleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var donViIdClaim = User.FindFirst("DonViId")?.Value;
        Guid? userDonViId = null;
        if (!string.IsNullOrEmpty(donViIdClaim) && Guid.TryParse(donViIdClaim, out var parsed))
            userDonViId = parsed;

        var result = await _giaiNganService.GetDeAnGiaiNganSummaryAsync(userRoleClaim, userDonViId);
        return Ok(result);
    }

    /// <summary>
    /// Lấy lịch sử giải ngân chi tiết của một đề án
    /// </summary>
    [HttpGet("dean/{deAnId}")]
    public async Task<IActionResult> GetByDeAn(Guid deAnId)
    {
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        if (role == "Role_CoSo" || role == "1")
        {
            var deAn = await _deAnService.GetByIdAsync(deAnId);
            if (deAn == null) return NotFound();
            var donViIdClaim = User.FindFirst("DonViId")?.Value;
            if (string.IsNullOrEmpty(donViIdClaim) || !Guid.TryParse(donViIdClaim, out var userDonViId) || deAn.DonViThuHuongId != userDonViId)
            {
                return Forbid();
            }
        }

        var result = await _giaiNganService.GetByDeAnIdAsync(deAnId);
        return Ok(result);
    }

    /// <summary>
    /// Tạo mới một đợt giải ngân (Tạm ứng hoặc Quyết toán) — Chỉ Sở, Bộ, Admin
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin")]
    public async Task<IActionResult> Create([FromBody] GiaiNganCreateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await _giaiNganService.CreateAsync(dto, GetUserId());
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Xóa một đợt giải ngân — Chỉ Admin
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Role_Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _giaiNganService.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    /// <summary>
    [HttpGet("export")]
    [Authorize(Roles = "Role_So,Role_Bo,Role_Admin,Role_TTKC,2,3,4,5")] // BUG-11 FIX: Chặn Role_CoSo tải file Excel toàn bộ ngân sách
    public async Task<IActionResult> ExportExcel()
    {
        // Fix lỗi EPPlus 8: Gọi hàm SetNonCommercialPersonal theo hướng dẫn mới
        OfficeOpenXml.ExcelPackage.License.SetNonCommercialPersonal("KhuyenCong Admin");
        var userRoleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var donViIdClaim = User.FindFirst("DonViId")?.Value;
        Guid? userDonViId = null;
        if (!string.IsNullOrEmpty(donViIdClaim) && Guid.TryParse(donViIdClaim, out var parsed))
            userDonViId = parsed;

        var data = await _giaiNganService.GetDeAnGiaiNganSummaryAsync(userRoleClaim, userDonViId);

        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("Bảng Kê Giải Ngân");

        // Headers
        worksheet.Cells[1, 1].Value = "STT";
        worksheet.Cells[1, 2].Value = "Mã Đề Án";
        worksheet.Cells[1, 3].Value = "Tên Đề Án";
        worksheet.Cells[1, 4].Value = "Đơn Vị Thụ Hưởng";
        worksheet.Cells[1, 5].Value = "Kinh Phí Dự Kiến (VNĐ)";
        worksheet.Cells[1, 6].Value = "Tổng Tạm Ứng (VNĐ)";
        worksheet.Cells[1, 7].Value = "Tổng Quyết Toán (VNĐ)";

        using (var range = worksheet.Cells[1, 1, 1, 7])
        {
            range.Style.Font.Bold = true;
            range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
        }

        // Data
        int row = 2;
        int stt = 1;
        foreach (var item in data)
        {
            worksheet.Cells[row, 1].Value = stt++;
            worksheet.Cells[row, 2].Value = item.MaDeAn;
            worksheet.Cells[row, 3].Value = item.TenDeAn;
            worksheet.Cells[row, 4].Value = item.TenDonViThuHuong;
            worksheet.Cells[row, 5].Value = item.KinhPhiDuKien;
            worksheet.Cells[row, 6].Value = item.TongTamUng;
            worksheet.Cells[row, 7].Value = item.TongQuyetToan;

            // Định dạng số tiền
            worksheet.Cells[row, 5, row, 7].Style.Numberformat.Format = "#,##0";

            row++;
        }

        worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

        var stream = new MemoryStream();
        await package.SaveAsAsync(stream);
        stream.Position = 0;

        string excelName = $"Bang_Ke_Giai_Ngan_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
        return File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelName);
    }
}
