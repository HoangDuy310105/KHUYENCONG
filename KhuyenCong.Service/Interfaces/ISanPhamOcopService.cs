using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface ISanPhamOcopService
{
    Task<(IEnumerable<SanPhamOcopDto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search, string? capChungNhan, int? phanHangSao, int? loaiSanPham, int? trangThai);
    Task<SanPhamOcopDto?> GetByIdAsync(Guid id);
    Task<SanPhamOcopDto> CreateAsync(SanPhamOcopDto dto);
    Task<bool> UpdateAsync(Guid id, SanPhamOcopDto dto);
    Task<bool> DeleteAsync(Guid id);
}
