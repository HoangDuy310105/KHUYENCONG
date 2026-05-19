using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface IDonViService
{
    Task<(IEnumerable<DonViDto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search);
    Task<DonViDto?> GetByIdAsync(Guid id);
    Task<DonViDto> CreateAsync(DonViDto donViDto);
    Task<bool> UpdateAsync(Guid id, DonViDto donViDto);
    Task<bool> DeleteAsync(Guid id);
    Task<byte[]> ExportExcelAsync();
    Task<int> ImportExcelAsync(System.IO.Stream stream);
}
