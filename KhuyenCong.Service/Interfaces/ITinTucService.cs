using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface ITinTucService
{
    Task<(IEnumerable<TinTucDto> Items, int TotalCount)> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null, string? category = null);
    Task<TinTucDto?> GetByIdAsync(Guid id);
    Task<TinTucDto> CreateAsync(CreateTinTucDto request);
    Task<bool> UpdateAsync(Guid id, UpdateTinTucDto request);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> IncrementViewCountAsync(Guid id);
}
