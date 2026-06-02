using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MiniExcelLibs;
using KhuyenCong.Data.Context;
using System;
using System.Collections.Generic;

namespace KhuyenCong.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class BaoCaoController : ControllerBase
{
    private readonly KhuyenCongDbContext _context;

    public BaoCaoController(KhuyenCongDbContext context)
    {
        _context = context;
    }

    [HttpGet("export-tt34")]
    public async Task<IActionResult> ExportTT34([FromQuery] int year)
    {
        if (year <= 0) year = DateTime.Now.Year;

        var deAns = await _context.Set<KhuyenCong.Core.Entities.DeAn>()
            .Include(x => x.DonViThuHuong)
            .Include(x => x.LinhVuc)
            .Where(x => x.ThoiGianBatDau != null && x.ThoiGianBatDau.Value.Year == year)
            .ToListAsync();

        var exportData = new List<object>();
        int index = 1;

        foreach (var da in deAns)
        {
            exportData.Add(new
            {
                STT = index++,
                TenDeAn = da.TenDeAn,
                LinhVuc = da.LinhVuc?.TenLinhVuc ?? "Khác",
                DonViThuHuong = da.DonViThuHuong?.TenDonVi ?? "",
                KinhPhiDuKien = da.KinhPhiDuKien,
                ThoiGianThucHien = da.ThoiGianBatDau?.ToString("dd/MM/yyyy") + " - " + da.ThoiGianKetThuc?.ToString("dd/MM/yyyy"),
                TrangThai = da.TrangThai.ToString()
            });
        }

        var memoryStream = new MemoryStream();
        await memoryStream.SaveAsAsync(exportData);
        memoryStream.Position = 0;

        return File(memoryStream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"BaoCao_TT34_Nam_{year}.xlsx");
    }
}
