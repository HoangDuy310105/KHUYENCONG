using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Core.Enums;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.Service.Implementations;

public class DeAnService : IDeAnService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeAnService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DeAnDto> CreateAsync(DeAnDto deAnDto)
    {
        var entity = _mapper.Map<DeAn>(deAnDto);

        // Tự động sinh mã đề án
        if (string.IsNullOrEmpty(entity.MaDeAn))
        {
            entity.MaDeAn = "DA-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        }

        // ⚠️ PostgreSQL yêu cầu DateTimeKind=UTC cho timestamptz
        // Convert tất cả DateTime fields về UTC để tránh lỗi Kind=Unspecified
        if (entity.ThoiGianBatDau.HasValue && entity.ThoiGianBatDau.Value.Kind != DateTimeKind.Utc)
            entity.ThoiGianBatDau = DateTime.SpecifyKind(entity.ThoiGianBatDau.Value, DateTimeKind.Utc);

        if (entity.ThoiGianKetThuc.HasValue && entity.ThoiGianKetThuc.Value.Kind != DateTimeKind.Utc)
            entity.ThoiGianKetThuc = DateTime.SpecifyKind(entity.ThoiGianKetThuc.Value, DateTimeKind.Utc);

        // Đề án mới luôn ở trạng thái Bản Nháp
        entity.TrangThai = KhuyenCong.Core.Enums.TrangThaiDeAn.BanNhap;

        await _unitOfWork.DeAns.AddAsync(entity);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<DeAnDto>(entity);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _unitOfWork.DeAns.GetByIdAsync(id);
        if (entity == null) return false;

        // Chỉ xóa khi chưa được duyệt
        if (entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DaPheDuyet ||
            entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DangThucHien)
        {
            throw new Exception("Không thể xóa đề án đã được phê duyệt hoặc đang thực hiện.");
        }

        _unitOfWork.DeAns.Remove(entity);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<DeAnDto?> GetByIdAsync(Guid id)
    {
        // Sử dụng FindAsync để có thể Include các bảng liên quan
        var entities = await _unitOfWork.DeAns.FindAsync(x => x.Id == id, "LinhVuc,DonViThuHuong,DonViThiCong,DonViGiamSat,GiaiNgans,TienDoThucHiens");
        var entity = entities.FirstOrDefault();
        
        if (entity == null) return null;

        var dto = _mapper.Map<DeAnDto>(entity);
        dto.SoLuongBaoCaoTienDo = entity.TienDoThucHiens?.Count ?? 0;
        return dto;
    }

    public async Task<(IEnumerable<DeAnDto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search, Guid? linhVucId, int? trangThai, Guid? userDonViId = null, string? userRole = null)
    {
        bool isCoSo = (userRole == "Role_CoSo" || userRole == "1");

        Expression<Func<DeAn, bool>> filter = x =>
            (string.IsNullOrEmpty(search) || x.TenDeAn.Contains(search) || x.MaDeAn.Contains(search))
            && (!linhVucId.HasValue || linhVucId == Guid.Empty || x.LinhVucId == linhVucId.Value)
            && (!trangThai.HasValue || (int)x.TrangThai == trangThai.Value)
            && (!isCoSo || (userDonViId.HasValue && (x.DonViThuHuongId == userDonViId.Value || x.DonViThiCongId == userDonViId.Value)));

        var (items, totalCount) = await _unitOfWork.DeAns.GetPagedAsync(page, pageSize, filter, "LinhVuc,DonViThuHuong,DonViThiCong,DonViGiamSat,GiaiNgans,TienDoThucHiens");

        var dtos = _mapper.Map<IEnumerable<DeAnDto>>(items).ToList();

        // [MOCK/DEMO] Nếu chưa có tọa độ trong DB, tự động random tọa độ khu vực Bến Tre để hiển thị lên bản đồ
        foreach (var dto in dtos)
        {
            var item = items.First(x => x.Id == dto.Id);
            dto.SoLuongBaoCaoTienDo = item.TienDoThucHiens?.Count ?? 0;

            if (dto.ViDo == null || dto.ViDo == 0 || dto.KinhDo == null || dto.KinhDo == 0)
            {
                var rand = new Random(dto.Id.GetHashCode());
                dto.ViDo = 10.1 + (rand.NextDouble() * 0.3);
                dto.KinhDo = 106.2 + (rand.NextDouble() * 0.4);
            }
        }

        return (dtos, totalCount);
    }

    public async Task<bool> UpdateAsync(Guid id, DeAnDto deAnDto)
    {
        var entity = await _unitOfWork.DeAns.GetByIdAsync(id);
        if (entity == null) return false;

        // Không cho phép sửa nếu đã phê duyệt hoặc đang thực hiện
        if (entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DaPheDuyet ||
            entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DangThucHien)
        {
            throw new Exception("Không thể cập nhật đề án đã được phê duyệt hoặc đang thực hiện.");
        }

        _mapper.Map(deAnDto, entity);
        // Giữ nguyên trạng thái cũ
        entity.Id = id;

        // ⚠️ Convert DateTime về UTC cho PostgreSQL
        if (entity.ThoiGianBatDau.HasValue && entity.ThoiGianBatDau.Value.Kind != DateTimeKind.Utc)
            entity.ThoiGianBatDau = DateTime.SpecifyKind(entity.ThoiGianBatDau.Value, DateTimeKind.Utc);

        if (entity.ThoiGianKetThuc.HasValue && entity.ThoiGianKetThuc.Value.Kind != DateTimeKind.Utc)
            entity.ThoiGianKetThuc = DateTime.SpecifyKind(entity.ThoiGianKetThuc.Value, DateTimeKind.Utc);

        _unitOfWork.DeAns.Update(entity);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> UpdateStatusAsync(Guid id, TrangThaiDeAn newStatus)
    {
        var deAn = await _unitOfWork.DeAns.GetByIdAsync(id);
        if (deAn == null) return false;

        deAn.TrangThai = newStatus;
        deAn.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.DeAns.Update(deAn);
        return await _unitOfWork.CompleteAsync() > 0;
    }

    public async Task<bool> QuyetToanAsync(Guid id, Guid userId)
    {
        var deAn = await _unitOfWork.DeAns.GetByIdAsync(id);
        if (deAn == null) return false;

        deAn.TrangThai = TrangThaiDeAn.DaQuyetToan;
        deAn.UpdatedAt = DateTime.UtcNow;
        
        var lichSu = new KhuyenCong.Core.Entities.LichSuThaoTac
        {
            Id = Guid.NewGuid(),
            DeAnId = deAn.Id,
            NguoiDungId = userId,
            HanhDong = "Thanh lý Quyết toán",
            TrangThaiCu = deAn.TrangThai,
            TrangThaiMoi = TrangThaiDeAn.DaQuyetToan,
            LyDo = "Đã hoàn thành quyết toán dự án.",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _unitOfWork.LichSuThaoTacs.AddAsync(lichSu);

        _unitOfWork.DeAns.Update(deAn);
        return await _unitOfWork.CompleteAsync() > 0;
    }

    public async Task<bool> UpdateStatusAsync(Guid id, int trangThaiMoi, string? ghiChu)
    {
        var entity = await _unitOfWork.DeAns.GetByIdAsync(id);
        if (entity == null) return false;

        entity.TrangThai = (KhuyenCong.Core.Enums.TrangThaiDeAn)trangThaiMoi;

        if (!string.IsNullOrEmpty(ghiChu))
        {
            entity.GhiChu = ghiChu;
        }

        // BR-R03: Điều kiện xin Nghiệm thu: Số lượng Báo cáo tiến độ >= 1
        if (trangThaiMoi == (int)KhuyenCong.Core.Enums.TrangThaiDeAn.DaNghiemThu)
        {
            var baoCaos = await _unitOfWork.TienDoThucHiens.FindAsync(x => x.DeAnId == id);
            if (!baoCaos.Any())
            {
                throw new Exception("Không thể chuyển sang Đã Nghiệm Thu: Yêu cầu Đề án phải nộp ít nhất 1 báo cáo tiến độ thi công.");
            }
        }

        // TODO: Lưu vết Audit Log với Ghi chú

        _unitOfWork.DeAns.Update(entity);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
