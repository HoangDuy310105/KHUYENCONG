using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Interfaces;
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
        // Repository cơ bản chưa include Navigation Properties.
        // Tạm thời trả về entity đơn thuần.
        var entity = await _unitOfWork.DeAns.GetByIdAsync(id);
        if (entity == null) return null;

        var dto = _mapper.Map<DeAnDto>(entity);
        
        // Cập nhật thông tin mở rộng nếu cần
        if (entity.LinhVucId != Guid.Empty)
        {
            var linhVuc = await _unitOfWork.LinhVucs.GetByIdAsync(entity.LinhVucId);
            dto.TenLinhVuc = linhVuc?.TenLinhVuc;
        }

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

        var (items, totalCount) = await _unitOfWork.DeAns.GetPagedAsync(page, pageSize, filter);

        var dtos = _mapper.Map<IEnumerable<DeAnDto>>(items).ToList();

        // Cập nhật thêm thông tin hiển thị (Nên dùng Include trong Repo thay vì vòng lặp, nhưng tạm thời để MVP)
        foreach (var dto in dtos)
        {
            if (dto.LinhVucId != Guid.Empty)
            {
                var linhVuc = await _unitOfWork.LinhVucs.GetByIdAsync(dto.LinhVucId);
                dto.TenLinhVuc = linhVuc?.TenLinhVuc;
            }
            if (dto.DonViThuHuongId != Guid.Empty)
            {
                var donVi = await _unitOfWork.DonVis.GetByIdAsync(dto.DonViThuHuongId);
                dto.TenDonViThuHuong = donVi?.TenDonVi;
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

    public async Task<bool> UpdateStatusAsync(Guid id, int trangThaiMoi, string? ghiChu)
    {
        var entity = await _unitOfWork.DeAns.GetByIdAsync(id);
        if (entity == null) return false;

        entity.TrangThai = (KhuyenCong.Core.Enums.TrangThaiDeAn)trangThaiMoi;

        // TODO: Lưu vết Audit Log với Ghi chú

        _unitOfWork.DeAns.Update(entity);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
