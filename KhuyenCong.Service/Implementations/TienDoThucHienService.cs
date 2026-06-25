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
            FileBaoCaoUrl = x.FileBaoCao != null ? JsonSerializer.Serialize(x.FileBaoCao) : null,
            PhanTramThucTe = x.PhanTramThucTe,
            BienBanKiemTraUrl = x.BienBanKiemTra != null ? JsonSerializer.Serialize(x.BienBanKiemTra) : null,
            TrangThaiDuyet = (int)x.TrangThaiDuyet,
            LyDoTuChoi = x.LyDoTuChoi
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
            FileBaoCao = !string.IsNullOrEmpty(dto.FileBaoCaoUrl) ? JsonDocument.Parse(dto.FileBaoCaoUrl) : null,
            TrangThaiDuyet = KhuyenCong.Core.Enums.TrangThaiDuyetTienDo.ChoKiemTra
        };

        await _unitOfWork.TienDoThucHiens.AddAsync(entity);
        
        // Cập nhật trạng thái của Đề án nếu đạt 100% (Ví dụ: tuỳ nghiệp vụ có thể update lên hoàn thành, nhưng thường Sở sẽ nghiệm thu)
        // Hiện tại chỉ lưu tiến độ.

        await _unitOfWork.CompleteAsync();

        dto.Id = entity.Id;
        return dto;
    }

    public async Task<bool> KiemTraThucDiaAsync(Guid id, int phanTramThucTe, string? bienBanKiemTraUrl)
    {
        var entity = await _unitOfWork.TienDoThucHiens.GetByIdAsync(id);
        if (entity == null) return false;

        entity.PhanTramThucTe = phanTramThucTe;
        if (!string.IsNullOrEmpty(bienBanKiemTraUrl))
        {
            entity.BienBanKiemTra = JsonDocument.Parse(bienBanKiemTraUrl);
        }
        
        entity.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.TienDoThucHiens.Update(entity);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> DuyetBaoCaoAsync(Guid id, bool isApproved, string? lyDoTuChoi, Guid? userId)
    {
        var entity = await _unitOfWork.TienDoThucHiens.GetByIdAsync(id);
        if (entity == null) return false;

        if (isApproved)
        {
            // Yêu cầu phải có biên bản kiểm tra mới được duyệt
            if (entity.BienBanKiemTra == null)
            {
                throw new Exception("Bắt buộc phải cập nhật Biên bản kiểm tra thực địa trước khi phê duyệt.");
            }
            entity.TrangThaiDuyet = KhuyenCong.Core.Enums.TrangThaiDuyetTienDo.DaPheDuyet;
            entity.LyDoTuChoi = null;
        }
        else
        {
            if (string.IsNullOrWhiteSpace(lyDoTuChoi))
            {
                throw new Exception("Bắt buộc phải nhập lý do khi yêu cầu bổ sung/từ chối.");
            }
            entity.TrangThaiDuyet = KhuyenCong.Core.Enums.TrangThaiDuyetTienDo.YeuCauBoSung;
            entity.LyDoTuChoi = lyDoTuChoi;
        }

        entity.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.TienDoThucHiens.Update(entity);

        // Lưu vào lịch sử thao tác
        if (userId.HasValue)
        {
            var deAn = await _unitOfWork.DeAns.GetByIdAsync(entity.DeAnId);
            if (deAn != null)
            {
                var lichSu = new LichSuThaoTac
                {
                    Id = Guid.NewGuid(),
                    DeAnId = deAn.Id,
                    NguoiDungId = userId.Value,
                    HanhDong = isApproved ? $"Phê duyệt Báo cáo tiến độ ({entity.PhanTramThucTe}%)" : "Yêu cầu bổ sung Báo cáo tiến độ",
                    TrangThaiCu = deAn.TrangThai,
                    TrangThaiMoi = deAn.TrangThai,
                    LyDo = lyDoTuChoi,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _unitOfWork.LichSuThaoTacs.AddAsync(lichSu);
            }
        }

        await _unitOfWork.CompleteAsync();
        return true;
    }
}
