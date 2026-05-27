using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Enums;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using Microsoft.EntityFrameworkCore;
using KhuyenCong.Data.Context;

namespace KhuyenCong.Service.Implementations;

public class GiaiNganService : IGiaiNganService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly KhuyenCongDbContext _context;

    public GiaiNganService(IUnitOfWork unitOfWork, KhuyenCongDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    public async Task<IEnumerable<DeAnGiaiNganSummaryDto>> GetDeAnGiaiNganSummaryAsync()
    {
        // Lấy tất cả đề án có trạng thái >= DaPheDuyet (5) kèm thông tin giải ngân
        var deAns = await _context.DeAns
            .Include(d => d.DonViThuHuong)
            .Include(d => d.GiaiNgans)
            .Where(d => (int)d.TrangThai >= 5)
            .ToListAsync();

        return deAns.Select(d => new DeAnGiaiNganSummaryDto
        {
            Id = d.Id,
            MaDeAn = d.MaDeAn,
            TenDeAn = d.TenDeAn,
            TenDonViThuHuong = d.DonViThuHuong?.TenDonVi,
            KinhPhiDuKien = d.KinhPhiDuKien,
            NguonKinhPhi = (int)d.NguonKinhPhi,
            TrangThai = (int)d.TrangThai,
            TongTamUng = d.GiaiNgans
                .Where(g => g.LoaiGiaiNgan == LoaiGiaiNgan.TamUng)
                .Sum(g => g.SoTien),
            TongQuyetToan = d.GiaiNgans
                .Where(g => g.LoaiGiaiNgan == LoaiGiaiNgan.QuyetToan)
                .Sum(g => g.SoTien),
        }).ToList();
    }

    public async Task<IEnumerable<GiaiNganDto>> GetByDeAnIdAsync(Guid deAnId)
    {
        var list = await _unitOfWork.GiaiNgans.FindAsync(g => g.DeAnId == deAnId);
        return list.Select(g => new GiaiNganDto
        {
            Id = g.Id,
            DeAnId = g.DeAnId,
            LoaiGiaiNgan = (int)g.LoaiGiaiNgan,
            SoTien = g.SoTien,
            NgayGiaiNgan = g.NgayGiaiNgan,
            ChungTuDinhKem = g.ChungTuDinhKem?.RootElement.ToString()
        }).OrderByDescending(g => g.NgayGiaiNgan).ToList();
    }

    public async Task<GiaiNganDto> CreateAsync(GiaiNganCreateDto dto)
    {
        var deAn = await _unitOfWork.DeAns.GetByIdAsync(dto.DeAnId);
        if (deAn == null)
            throw new Exception("Không tìm thấy đề án.");

        if ((int)deAn.TrangThai < 5)
            throw new Exception("Chỉ có thể giải ngân cho đề án đã được phê duyệt.");

        var ngay = dto.NgayGiaiNgan.Kind != DateTimeKind.Utc
            ? DateTime.SpecifyKind(dto.NgayGiaiNgan, DateTimeKind.Utc)
            : dto.NgayGiaiNgan;

        var entity = new GiaiNgan
        {
            Id = Guid.NewGuid(),
            DeAnId = dto.DeAnId,
            LoaiGiaiNgan = (LoaiGiaiNgan)dto.LoaiGiaiNgan,
            SoTien = dto.SoTien,
            NgayGiaiNgan = ngay,
            ChungTuDinhKem = dto.GhiChu != null
                ? JsonDocument.Parse(JsonSerializer.Serialize(new { ghiChu = dto.GhiChu }))
                : null
        };

        await _unitOfWork.GiaiNgans.AddAsync(entity);
        await _unitOfWork.CompleteAsync();

        return new GiaiNganDto
        {
            Id = entity.Id,
            DeAnId = entity.DeAnId,
            LoaiGiaiNgan = (int)entity.LoaiGiaiNgan,
            SoTien = entity.SoTien,
            NgayGiaiNgan = entity.NgayGiaiNgan,
            TenDeAn = deAn.TenDeAn
        };
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _unitOfWork.GiaiNgans.GetByIdAsync(id);
        if (entity == null) return false;
        _unitOfWork.GiaiNgans.Remove(entity);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
