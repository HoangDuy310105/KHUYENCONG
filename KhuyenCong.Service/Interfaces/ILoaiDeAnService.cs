using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface ILoaiDeAnService
{
    Task<IEnumerable<LoaiDeAnDto>> GetAllAsync();
    Task<LoaiDeAnDto?> GetByIdAsync(Guid id);
    Task<LoaiDeAnDto> CreateAsync(LoaiDeAnDto loaiDeAnDto);
    Task<bool> UpdateAsync(Guid id, LoaiDeAnDto loaiDeAnDto);
    Task<bool> DeleteAsync(Guid id);
}
