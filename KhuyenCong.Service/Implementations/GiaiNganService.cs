using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Enums;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using Microsoft.EntityFrameworkCore;
using KhuyenCong.Data.Context;

namespace KhuyenCong.Service.Implementations;

public class GiaiNganService : IGiaiNganService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly KhuyenCongDbContext _context;

    public GiaiNganService(IUnitOfWork unitOfWork, KhuyenCongDbContext context)
    {
        _unitOfWork = unitOfWork;
        _context = context;
    }

    public async Task<IEnumerable<DeAnGiaiNganSummaryDto>> GetDeAnGiaiNganSummaryAsync(string? userRole = null, Guid? userDonViId = null)
    {
        // Lấy tất cả đề án có trạng thái >= DaPheDuyet (5) kèm thông tin giải ngân
        var query = _context.DeAns
            .Include(d => d.DonViThuHuong)
            .Include(d => d.GiaiNgans)
            .Where(d => (int)d.TrangThai >= 5);

        // Nếu là Role_CoSo thì chỉ lấy đề án của đơn vị mình
        if ((userRole == "Role_CoSo" || userRole == "1") && userDonViId.HasValue)
        {
            query = query.Where(d => d.DonViThuHuongId == userDonViId.Value || d.DonViThiCongId == userDonViId.Value);
        }

        var deAns = await query.ToListAsync();

        return deAns.Select(d => new DeAnGiaiNganSummaryDto
        {
            Id = d.Id,
            MaDeAn = d.MaDeAn,
            TenDeAn = d.TenDeAn,
            TenDonViThuHuong = d.DonViThuHuong?.TenDonVi,
            KinhPhiDuKien = d.KinhPhiDuKien,
            NguonKinhPhi = (int)d.NguonKinhPhi,
            TrangThai = (int)d.TrangThai,
            TongTamUng = d.GiaiNgans
                .Where(g => g.LoaiGiaiNgan == LoaiGiaiNgan.TamUng)
                .Sum(g => g.SoTien),
            TongQuyetToan = d.GiaiNgans
                .Where(g => g.LoaiGiaiNgan == LoaiGiaiNgan.QuyetToan)
                .Sum(g => g.SoTien),
        }).ToList();
    }

    public async Task<IEnumerable<GiaiNganDto>> GetByDeAnIdAsync(Guid deAnId)
    {
        var list = await _unitOfWork.GiaiNgans.FindAsync(g => g.DeAnId == deAnId);
        return list.Select(g => new GiaiNganDto
        {
            Id = g.Id,
            DeAnId = g.DeAnId,
            LoaiGiaiNgan = (int)g.LoaiGiaiNgan,
            SoTien = g.SoTien,
            NgayGiaiNgan = g.NgayGiaiNgan,
            ChungTuDinhKem = g.ChungTuDinhKem?.RootElement.ToString()
        }).OrderByDescending(g => g.NgayGiaiNgan).ToList();
    }

    public async Task<GiaiNganDto> CreateAsync(GiaiNganCreateDto dto, Guid? userId = null)
    {
        // BUG-08 FIX: Sử dụng Database Transaction với mức độ cô lập Serializable 
        // để khóa luồng chống lỗi Race Condition khi giải ngân liên tục
        using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

        var deAn = await _unitOfWork.DeAns.GetByIdAsync(dto.DeAnId);
        if (deAn == null)
            throw new Exception("Không tìm thấy đề án.");

        // Lấy danh sách giải ngân hiện tại của đề án này
        var cacGiaiNganCu = await _unitOfWork.GiaiNgans.FindAsync(g => g.DeAnId == dto.DeAnId);
        var tongTamUng = cacGiaiNganCu.Where(g => g.LoaiGiaiNgan == LoaiGiaiNgan.TamUng).Sum(g => g.SoTien);
        var tongQuyetToan = cacGiaiNganCu.Where(g => g.LoaiGiaiNgan == LoaiGiaiNgan.QuyetToan).Sum(g => g.SoTien);
        var tongGiaiNgan = tongTamUng + tongQuyetToan;

        if (dto.LoaiGiaiNgan == (int)LoaiGiaiNgan.TamUng)
        {
            if ((int)deAn.TrangThai < (int)TrangThaiDeAn.DaPheDuyet)
                throw new Exception("Chỉ có thể tạm ứng cho đề án đã được phê duyệt.");

            // BUG-06 / BR-F01: Quy tắc TRẦN TẠM ỨNG 70% theo Thông tư 28/2018/TT-BTC
            // Nguồn pháp lý: Thông tư 28/2018/TT-BTC (Bộ Tài Chính) hướng dẫn lập, quản lý,
            // sử dụng kinh phí khuyến công. Quy định tổng tạm ứng (tất cả các đợt) không được
            // vượt quá 70% Tổng kinh phí dự kiến được duyệt.
            // Lưu ý: Thông tư 64/2024/TT-BTC sửa đổi một số điều của TT28. Nếu có thay đổi
            // về tỷ lệ 70% này, cần cập nhật lại constant bên dưới cho phù hợp.
            const decimal TRAN_TAM_UNG = 0.7m; // 70% theo TT28/2018/TT-BTC
            var maxTamUng = deAn.KinhPhiDuKien * TRAN_TAM_UNG;
            if (tongTamUng + dto.SoTien > maxTamUng)
            {
                var conLai = maxTamUng - tongTamUng;
                throw new Exception(
                    $"Số tiền tạm ứng vượt hạn mức. Theo TT28/2018/TT-BTC, " +
                    $"tổng tạm ứng tối đa là 70% kinh phí dự kiến " +
                    $"({maxTamUng:N0} đ). Đã tạm ứng: {tongTamUng:N0} đ. " +
                    $"Còn có thể tạm ứng: {conLai:N0} đ.");
            }
        }
        else if (dto.LoaiGiaiNgan == (int)LoaiGiaiNgan.QuyetToan)
        {
            // BR-F03: Chỉ được quyết toán khi Trạng thái = Đã nghiệm thu (7)
            if (deAn.TrangThai != TrangThaiDeAn.DaNghiemThu && deAn.TrangThai != TrangThaiDeAn.DaQuyetToan)
                throw new Exception("Chỉ được quyết toán khi Đề án đã được Nghiệm thu.");

            // BR-F02: Tổng Giải ngân (Tạm ứng + Quyết toán) <= Kinh phí được duyệt
            if (tongGiaiNgan + dto.SoTien > deAn.KinhPhiDuKien)
                throw new Exception($"Tổng số tiền giải ngân vượt quá tổng Kinh phí dự kiến ({deAn.KinhPhiDuKien:N0} VNĐ).");
        }

        var ngay = dto.NgayGiaiNgan.Kind != DateTimeKind.Utc
            ? DateTime.SpecifyKind(dto.NgayGiaiNgan, DateTimeKind.Utc)
            : dto.NgayGiaiNgan;

        var entity = new GiaiNgan
        {
            Id = Guid.NewGuid(),
            DeAnId = dto.DeAnId,
            LoaiGiaiNgan = (LoaiGiaiNgan)dto.LoaiGiaiNgan,
            SoTien = dto.SoTien,
            NgayGiaiNgan = ngay,
            ChungTuDinhKem = dto.GhiChu != null
                ? JsonDocument.Parse(JsonSerializer.Serialize(new { ghiChu = dto.GhiChu }))
                : null
        };

        await _unitOfWork.GiaiNgans.AddAsync(entity);

        if (userId.HasValue)
        {
            var lichSu = new KhuyenCong.Core.Entities.LichSuThaoTac
            {
                Id = Guid.NewGuid(),
                DeAnId = deAn.Id,
                NguoiDungId = userId.Value,
                HanhDong = $"Thực hiện giải ngân {((LoaiGiaiNgan)dto.LoaiGiaiNgan)}: {dto.SoTien:N0} VNĐ",
                TrangThaiCu = deAn.TrangThai,
                TrangThaiMoi = deAn.TrangThai,
                LyDo = dto.GhiChu,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _unitOfWork.LichSuThaoTacs.AddAsync(lichSu);
        }

        await _unitOfWork.CompleteAsync();

        // BUG-05 FIX: Cập nhật KinhPhiThucHien = tổng tất cả giải ngân của đề án
        var allGiaiNgans = await _unitOfWork.GiaiNgans.FindAsync(g => g.DeAnId == dto.DeAnId);
        deAn.KinhPhiThucHien = allGiaiNgans.Sum(g => g.SoTien);
        deAn.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.DeAns.Update(deAn);
        await _unitOfWork.CompleteAsync();

        await transaction.CommitAsync(); // Xác nhận Transaction

        return new GiaiNganDto
        {
            Id = entity.Id,
            DeAnId = entity.DeAnId,
            LoaiGiaiNgan = (int)entity.LoaiGiaiNgan,
            SoTien = entity.SoTien,
            NgayGiaiNgan = entity.NgayGiaiNgan,
            TenDeAn = deAn.TenDeAn
        };
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _unitOfWork.GiaiNgans.GetByIdAsync(id);
        if (entity == null) return false;
        _unitOfWork.GiaiNgans.Remove(entity);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
