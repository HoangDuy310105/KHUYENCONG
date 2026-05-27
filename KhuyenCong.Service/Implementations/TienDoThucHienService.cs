using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.Service.Implementations;

public class TienDoThucHienService : ITienDoThucHienService
{
    private readonly IUnitOfWork _unitOfWork;

    public TienDoThucHienService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<TienDoThucHienDto>> GetByDeAnIdAsync(Guid deAnId)
    {
        var entities = await _unitOfWork.TienDoThucHiens.FindAsync(x => x.DeAnId == deAnId);
        
        return entities.Select(x => new TienDoThucHienDto
        {
            Id = x.Id,
            DeAnId = x.DeAnId,
            ThangBaoCao = x.ThangBaoCao,
            PhanTramHoanThanh = x.PhanTramHoanThanh,
            GhiChuThucTe = x.GhiChuThucTe,
            FileBaoCaoUrl = x.FileBaoCao != null ? JsonSerializer.Serialize(x.FileBaoCao) : null
        }).OrderByDescending(x => x.ThangBaoCao);
    }

    public async Task<TienDoThucHienDto> CreateAsync(TienDoThucHienDto dto)
    {
        var entity = new TienDoThucHien
        {
            DeAnId = dto.DeAnId,
            ThangBaoCao = dto.ThangBaoCao,
            PhanTramHoanThanh = dto.PhanTramHoanThanh,
            GhiChuThucTe = dto.GhiChuThucTe,
            FileBaoCao = !string.IsNullOrEmpty(dto.FileBaoCaoUrl) ? JsonDocument.Parse(dto.FileBaoCaoUrl) : null
        };

        await _unitOfWork.TienDoThucHiens.AddAsync(entity);
        
        // Cập nhật trạng thái của Đề án nếu đạt 100% (Ví dụ: tuỳ nghiệp vụ có thể update lên hoàn thành, nhưng thường Sở sẽ nghiệm thu)
        // Hiện tại chỉ lưu tiến độ.

        await _unitOfWork.CompleteAsync();

        dto.Id = entity.Id;
        return dto;
    }
}
