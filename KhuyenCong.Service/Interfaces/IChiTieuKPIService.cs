using System;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface IChiTieuKPIService
{
    Task<ChiTieuKPIDto?> GetByDeAnIdAsync(Guid deAnId);
    Task<ChiTieuKPIDto> SaveAsync(CreateChiTieuKPIDto dto);
}
