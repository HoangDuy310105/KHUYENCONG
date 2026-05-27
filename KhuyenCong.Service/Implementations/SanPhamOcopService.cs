using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace KhuyenCong.Service.Implementations;

public class SanPhamOcopService : ISanPhamOcopService
{
    private readonly IUnitOfWork _unitOfWork;

    public SanPhamOcopService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<(IEnumerable<SanPhamOcopDto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search, string? capChungNhan, int? phanHangSao, int? loaiSanPham, int? trangThai)
    {
        System.Linq.Expressions.Expression<Func<SanPhamOcop, bool>> filter = o => 
            (string.IsNullOrEmpty(search) || o.TenSanPham.ToLower().Contains(search.ToLower()) || (o.DonVi != null && o.DonVi.TenDonVi.ToLower().Contains(search.ToLower())))
            && (string.IsNullOrEmpty(capChungNhan) || capChungNhan == "Tất cả" || o.CapChungNhan == capChungNhan)
            && (!phanHangSao.HasValue || phanHangSao.Value == 0 || o.PhanHangSao == phanHangSao.Value)
            && (!loaiSanPham.HasValue || loaiSanPham.Value == 0 || o.LoaiSanPham == loaiSanPham.Value)
            && (!trangThai.HasValue || trangThai.Value == 0 || o.TrangThai == trangThai.Value);

        var (items, totalCount) = await _unitOfWork.SanPhamOcops.GetPagedAsync(page, pageSize, filter, includeProperties: "DonVi");

        var dtos = items.Select(o => new SanPhamOcopDto
        {
            Id = o.Id,
            TenSanPham = o.TenSanPham,
            DonViId = o.DonViId,
            TenDonVi = o.DonVi?.TenDonVi,
            PhanHangSao = o.PhanHangSao,
            CapChungNhan = o.CapChungNhan,
            NgayCongNhan = o.NgayCongNhan,
            QuyetDinhCongNhan = o.QuyetDinhCongNhan,
            HinhAnh = o.HinhAnh,
            LoaiSanPham = o.LoaiSanPham,
            TrangThai = o.TrangThai,
            NamBinhChon = o.NamBinhChon
        });

        return (dtos, totalCount);
    }

    public async Task<SanPhamOcopDto?> GetByIdAsync(Guid id)
    {
        var item = (await _unitOfWork.SanPhamOcops.GetAllAsync(filter: o => o.Id == id, includeProperties: "DonVi")).FirstOrDefault();
        if (item == null) return null;

        return new SanPhamOcopDto
        {
            Id = item.Id,
            TenSanPham = item.TenSanPham,
            DonViId = item.DonViId,
            TenDonVi = item.DonVi?.TenDonVi,
            PhanHangSao = item.PhanHangSao,
            CapChungNhan = item.CapChungNhan,
            NgayCongNhan = item.NgayCongNhan,
            QuyetDinhCongNhan = item.QuyetDinhCongNhan,
            HinhAnh = item.HinhAnh,
            LoaiSanPham = item.LoaiSanPham,
            TrangThai = item.TrangThai,
            NamBinhChon = item.NamBinhChon
        };
    }

    public async Task<SanPhamOcopDto> CreateAsync(SanPhamOcopDto dto)
    {
        var entity = new SanPhamOcop
        {
            TenSanPham = dto.TenSanPham,
            DonViId = dto.DonViId,
            PhanHangSao = dto.PhanHangSao,
            CapChungNhan = dto.CapChungNhan ?? string.Empty,
            NgayCongNhan = dto.NgayCongNhan,
            QuyetDinhCongNhan = dto.QuyetDinhCongNhan ?? string.Empty,
            HinhAnh = dto.HinhAnh,
            LoaiSanPham = dto.LoaiSanPham,
            TrangThai = dto.TrangThai,
            NamBinhChon = dto.NamBinhChon
        };

        await _unitOfWork.SanPhamOcops.AddAsync(entity);
        await _unitOfWork.CompleteAsync();

        dto.Id = entity.Id;
        return dto;
    }

    public async Task<bool> UpdateAsync(Guid id, SanPhamOcopDto dto)
    {
        var existing = await _unitOfWork.SanPhamOcops.GetByIdAsync(id);
        if (existing == null) return false;

        existing.TenSanPham = dto.TenSanPham;
        existing.DonViId = dto.DonViId;
        existing.PhanHangSao = dto.PhanHangSao;
        existing.CapChungNhan = dto.CapChungNhan ?? string.Empty;
        existing.NgayCongNhan = dto.NgayCongNhan;
        existing.QuyetDinhCongNhan = dto.QuyetDinhCongNhan ?? string.Empty;
        existing.HinhAnh = dto.HinhAnh;
        existing.LoaiSanPham = dto.LoaiSanPham;
        existing.TrangThai = dto.TrangThai;
        existing.NamBinhChon = dto.NamBinhChon;
        existing.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.SanPhamOcops.Update(existing);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _unitOfWork.SanPhamOcops.GetByIdAsync(id);
        if (existing == null) return false;

        _unitOfWork.SanPhamOcops.Remove(existing);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
