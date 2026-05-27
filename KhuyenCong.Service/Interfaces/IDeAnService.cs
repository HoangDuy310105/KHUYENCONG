using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface IDeAnService
{
    Task<(IEnumerable<DeAnDto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search, Guid? linhVucId, int? trangThai, Guid? userDonViId = null, string? userRole = null);
    Task<DeAnDto?> GetByIdAsync(Guid id);
    Task<DeAnDto> CreateAsync(DeAnDto deAnDto);
    Task<bool> UpdateAsync(Guid id, DeAnDto deAnDto);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> UpdateStatusAsync(Guid id, int trangThaiMoi, string? ghiChu);
}
