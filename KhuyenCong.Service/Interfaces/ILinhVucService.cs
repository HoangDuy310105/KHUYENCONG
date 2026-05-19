using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface ILinhVucService
{
    Task<IEnumerable<LinhVucDto>> GetAllAsync();
    Task<LinhVucDto?> GetByIdAsync(System.Guid id);
    Task<LinhVucDto> CreateAsync(LinhVucDto linhVucDto);
    Task<bool> UpdateAsync(System.Guid id, LinhVucDto linhVucDto);
    Task<bool> DeleteAsync(System.Guid id);
}
