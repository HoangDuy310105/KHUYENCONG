using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface ITienDoThucHienService
{
    Task<IEnumerable<TienDoThucHienDto>> GetByDeAnIdAsync(Guid deAnId);
    Task<TienDoThucHienDto> CreateAsync(TienDoThucHienDto dto);
    
    // Thêm các hàm nghiệp vụ theo quy trình mới (BUG-04)
    Task<bool> KiemTraThucDiaAsync(Guid id, int phanTramThucTe, string? bienBanKiemTraUrl);
    Task<bool> DuyetBaoCaoAsync(Guid id, bool isApproved, string? lyDoTuChoi, Guid? userId);
}
