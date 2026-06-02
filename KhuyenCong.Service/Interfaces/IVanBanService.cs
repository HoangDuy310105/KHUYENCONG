using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface IVanBanService
{
    Task<(IEnumerable<VanBanDto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? keyword = null, int? loaiTaiLieu = null);
    Task<VanBanDto?> GetByIdAsync(Guid id);
    Task<VanBanDto> CreateAsync(VanBanDto vanBanDto);
    Task<bool> UpdateAsync(Guid id, VanBanDto vanBanDto);
    Task<bool> DeleteAsync(Guid id);
}
