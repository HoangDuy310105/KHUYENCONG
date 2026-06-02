using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KhuyenCong.Data.Context;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.Service.Implementations;

public class DashboardService : IDashboardService
{
    private readonly KhuyenCongDbContext _context;

    public DashboardService(KhuyenCongDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        var totalDeAn = await _context.Set<KhuyenCong.Core.Entities.DeAn>().CountAsync();
        var totalDoanhNghiep = await _context.Set<KhuyenCong.Core.Entities.DonVi>()
                               .Where(x => x.LoaiDonVi == KhuyenCong.Core.Enums.LoaiDonVi.ThuHuong)
                               .CountAsync();
        var totalKinhPhi = await _context.Set<KhuyenCong.Core.Entities.DeAn>()
                           .SumAsync(x => x.KinhPhiDuKien);
        var inProgress = await _context.Set<KhuyenCong.Core.Entities.DeAn>()
                         .Where(x => x.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DangThucHien)
                         .CountAsync();
        var totalOcop = await _context.Set<KhuyenCong.Core.Entities.SanPhamOcop>().CountAsync();

        return new DashboardSummaryDto
        {
            TotalDeAn = totalDeAn,
            TotalDoanhNghiep = totalDoanhNghiep,
            TotalKinhPhi = totalKinhPhi,
            InProgressDeAn = inProgress,
            TotalOcop = totalOcop
        };
    }

    public async Task<List<ChartDataDto>> GetProjectsByFieldAsync()
    {
        var fields = await _context.Set<KhuyenCong.Core.Entities.LinhVuc>()
            .Include(x => x.DeAns)
            .Select(x => new ChartDataDto
            {
                Label = x.TenLinhVuc,
                Value = x.DeAns.Count,
                Amount = x.DeAns.Sum(d => d.KinhPhiDuKien)
            })
            .OrderByDescending(x => x.Value)
            .Take(6)
            .ToListAsync();
            
        return fields;
    }

    public async Task<List<MapMarkerDto>> GetMapMarkersAsync()
    {
        var markers = new List<MapMarkerDto>();

        // 1: Doanh nghiệp thụ hưởng
        var donVis = await _context.Set<KhuyenCong.Core.Entities.DonVi>()
            .Where(x => x.LoaiDonVi == KhuyenCong.Core.Enums.LoaiDonVi.ThuHuong && x.ViDo != null && x.KinhDo != null)
            .ToListAsync();

        foreach (var dv in donVis)
        {
            markers.Add(new MapMarkerDto
            {
                Title = dv.TenDonVi,
                Subtitle = dv.DiaChi ?? "Doanh nghiệp",
                Lat = dv.ViDo ?? 0,
                Lng = dv.KinhDo ?? 0,
                Type = 1
            });
        }

        // 3: OCOP (sử dụng tọa độ của Đơn vị đăng ký)
        var ocops = await _context.Set<KhuyenCong.Core.Entities.SanPhamOcop>()
            .Include(x => x.DonVi)
            .Where(x => x.DonVi != null && x.DonVi.ViDo != null && x.DonVi.KinhDo != null)
            .ToListAsync();
            
        foreach (var o in ocops)
        {
            markers.Add(new MapMarkerDto
            {
                Title = o.TenSanPham,
                Subtitle = $"OCOP {o.PhanHangSao} Sao - {o.DonVi?.TenDonVi}",
                Lat = (o.DonVi!.ViDo ?? 0) + 0.001, // Lệch 1 chút so với Đơn vị để khỏi đè nhau
                Lng = (o.DonVi.KinhDo ?? 0) + 0.001,
                Type = 3
            });
        }

        return markers;
    }
}
