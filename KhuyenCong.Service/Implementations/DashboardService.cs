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

        // 2: Đề án khuyến công (Ưu tiên tọa độ địa điểm thực hiện đề án, nếu không có mới kế thừa từ Đơn vị)
        var deAns = await _context.Set<KhuyenCong.Core.Entities.DeAn>()
            .Include(x => x.DonViThuHuong)
            .Where(x => x.DonViThuHuong != null)
            .ToListAsync();

        foreach (var da in deAns)
        {
            double lat = da.DonViThuHuong!.ViDo ?? 0;
            double lng = da.DonViThuHuong.KinhDo ?? 0;

            // Kiểm tra tọa độ riêng biệt của Đề án trong JSON HoSoDinhKem
            if (da.HoSoDinhKem != null)
            {
                var doc = da.HoSoDinhKem.RootElement;
                if (doc.TryGetProperty("viDo", out var viDoProp) && viDoProp.ValueKind == System.Text.Json.JsonValueKind.Number &&
                    doc.TryGetProperty("kinhDo", out var kinhDoProp) && kinhDoProp.ValueKind == System.Text.Json.JsonValueKind.Number)
                {
                    lat = viDoProp.GetDouble();
                    lng = kinhDoProp.GetDouble();
                }
            }

            if (lat == 0 && lng == 0) continue; // Bỏ qua nếu không có tọa độ nào cả

            markers.Add(new MapMarkerDto
            {
                Title = da.TenDeAn,
                Subtitle = $"Đề án - {da.DonViThuHuong?.TenDonVi}",
                Lat = lat,
                Lng = lng,
                Type = 2
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
