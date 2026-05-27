using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface ITienDoThucHienService
{
    Task<IEnumerable<TienDoThucHienDto>> GetByDeAnIdAsync(Guid deAnId);
    Task<TienDoThucHienDto> CreateAsync(TienDoThucHienDto dto);
}
