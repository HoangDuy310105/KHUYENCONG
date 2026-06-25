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
using Microsoft.EntityFrameworkCore;

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
        // BR-F04: Kiểm tra định mức chi tối đa theo Thông tư 28
        if (deAnDto.KinhPhiDuKien > 300_000_000m)
        {
            throw new Exception("Kinh phí đề nghị hỗ trợ vượt mức trần quy định (300,000,000 VNĐ) theo Thông tư 28. Vui lòng điều chỉnh lại.");
        }

        // M07 FIX: Validate Đơn vị thụ hưởng phải là DNNVV hoặc HTX
        if (deAnDto.DonViThuHuongId != Guid.Empty)
        {
            var dv = await _unitOfWork.DonVis.GetByIdAsync(deAnDto.DonViThuHuongId);
            if (dv == null || string.IsNullOrEmpty(dv.QuyMo) || (!dv.QuyMo.Contains("DNNVV") && !dv.QuyMo.Contains("HTX") && !dv.QuyMo.Contains("Tổ hợp tác")))
            {
                throw new Exception("Đơn vị thụ hưởng bắt buộc phải là DNNVV, Hợp tác xã hoặc Tổ hợp tác (Theo NĐ 45/2012/NĐ-CP).");
            }
        }

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

        // Đảm bảo có tọa độ trong HoSoDinhKem bằng Backend Geocoding nếu bị thiếu
        if (entity.HoSoDinhKem != null)
        {
            var root = entity.HoSoDinhKem.RootElement;
            bool hasViDo = root.TryGetProperty("viDo", out var v) && v.ValueKind != System.Text.Json.JsonValueKind.Null;
            if (!hasViDo && root.TryGetProperty("diaDiemThucHien", out var diaDiemProp))
            {
                var diaDiem = diaDiemProp.GetString();
                if (!string.IsNullOrEmpty(diaDiem))
                {
                    var coords = await KhuyenCong.Service.Helpers.GeocodingHelper.GetCoordinatesAsync(diaDiem);
                    if (coords.lat != null && coords.lon != null)
                    {
                        // Cập nhật lại chuỗi JSON
                        var jsonStr = entity.HoSoDinhKem.RootElement.GetRawText();
                        var jsonObj = System.Text.Json.Nodes.JsonObject.Parse(jsonStr)!.AsObject();
                        jsonObj["viDo"] = coords.lat;
                        jsonObj["kinhDo"] = coords.lon;
                        entity.HoSoDinhKem = System.Text.Json.JsonDocument.Parse(jsonObj.ToJsonString());
                    }
                }
            }
        }

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
            entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DangThucHien ||
            entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DaQuyetToan)
        {
            throw new Exception("Không thể xóa đề án đã được phê duyệt, đang thực hiện hoặc đã quyết toán.");
        }

        _unitOfWork.DeAns.Remove(entity);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<DeAnDto?> GetByIdAsync(Guid id)
    {
        // Sử dụng FindAsync để có thể Include các bảng liên quan
        var entities = await _unitOfWork.DeAns.FindAsync(x => x.Id == id, "LoaiDeAn,LinhVuc,DonViThuHuong,DonViThiCong,DonViGiamSat,GiaiNgans,TienDoThucHiens");
        var entity = entities.FirstOrDefault();
        
        if (entity == null) return null;

        var dto = _mapper.Map<DeAnDto>(entity);
        dto.SoLuongBaoCaoTienDo = entity.TienDoThucHiens?.Count ?? 0;
        
        // Trích xuất tọa độ từ HoSoDinhKem, nếu không có thì lấy của Công ty
        if (entity.HoSoDinhKem != null)
        {
            var doc = entity.HoSoDinhKem.RootElement;
            if (doc.TryGetProperty("viDo", out var viDoProp) && viDoProp.ValueKind == System.Text.Json.JsonValueKind.Number &&
                doc.TryGetProperty("kinhDo", out var kinhDoProp) && kinhDoProp.ValueKind == System.Text.Json.JsonValueKind.Number)
            {
                dto.ViDo = viDoProp.GetDouble();
                dto.KinhDo = kinhDoProp.GetDouble();
            }
            if (string.IsNullOrEmpty(dto.DiaDiem) && doc.TryGetProperty("diaDiemThucHien", out var diaDiemProp) && diaDiemProp.ValueKind != System.Text.Json.JsonValueKind.Null)
            {
                dto.DiaDiem = diaDiemProp.GetString();
            }
        }
        
        if ((dto.ViDo == null || dto.ViDo == 0) && entity.DonViThuHuong != null)
        {
            dto.ViDo = entity.DonViThuHuong.ViDo;
            dto.KinhDo = entity.DonViThuHuong.KinhDo;
        }

        return dto;
    }

    public async Task<(IEnumerable<DeAnDto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search, Guid? linhVucId, int? trangThai, Guid? userDonViId = null, string? userRole = null)
    {
        bool isCoSo = (userRole == "Role_CoSo" || userRole == "1");

        Expression<Func<DeAn, bool>> filter = x =>
            (string.IsNullOrEmpty(search) || Microsoft.EntityFrameworkCore.EF.Functions.ILike(x.TenDeAn, $"%{search}%") || Microsoft.EntityFrameworkCore.EF.Functions.ILike(x.MaDeAn, $"%{search}%"))
            && (!linhVucId.HasValue || linhVucId == Guid.Empty || x.LinhVucId == linhVucId.Value)
            && (!trangThai.HasValue || (int)x.TrangThai == trangThai.Value)
            && (!isCoSo || (userDonViId.HasValue && (x.DonViThuHuongId == userDonViId.Value || x.DonViThiCongId == userDonViId.Value)));

        var (items, totalCount) = await _unitOfWork.DeAns.GetPagedAsync(page, pageSize, filter, "LoaiDeAn,LinhVuc,DonViThuHuong,DonViThiCong,DonViGiamSat,GiaiNgans,TienDoThucHiens");

        var dtos = _mapper.Map<IEnumerable<DeAnDto>>(items).ToList();

        foreach (var dto in dtos)
        {
            var item = items.First(x => x.Id == dto.Id);
            dto.SoLuongBaoCaoTienDo = item.TienDoThucHiens?.Count ?? 0;
            
            // Ưu tiên 1: Tọa độ riêng của dự án trong JSON HoSoDinhKem
            if (item.HoSoDinhKem != null)
            {
                var doc = item.HoSoDinhKem.RootElement;
                if (doc.TryGetProperty("viDo", out var viDoProp) && viDoProp.ValueKind == System.Text.Json.JsonValueKind.Number &&
                    doc.TryGetProperty("kinhDo", out var kinhDoProp) && kinhDoProp.ValueKind == System.Text.Json.JsonValueKind.Number)
                {
                    dto.ViDo = viDoProp.GetDouble();
                    dto.KinhDo = kinhDoProp.GetDouble();
                }
                if (string.IsNullOrEmpty(dto.DiaDiem) && doc.TryGetProperty("diaDiemThucHien", out var diaDiemProp) && diaDiemProp.ValueKind != System.Text.Json.JsonValueKind.Null)
                {
                    dto.DiaDiem = diaDiemProp.GetString();
                }
            }

            // Ưu tiên 2: Nếu dự án không có tọa độ, kế thừa tọa độ từ Đơn vị thụ hưởng
            if (dto.ViDo == null || dto.ViDo == 0 || dto.KinhDo == null || dto.KinhDo == 0)
            {
                if (item.DonViThuHuong != null)
                {
                    dto.ViDo = item.DonViThuHuong.ViDo;
                    dto.KinhDo = item.DonViThuHuong.KinhDo;
                }
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
            entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DangThucHien ||
            entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DaQuyetToan)
        {
            throw new Exception("Không thể cập nhật đề án đã được phê duyệt, đang thực hiện hoặc đã quyết toán.");
        }

        // M07 FIX: Validate Đơn vị thụ hưởng phải là DNNVV hoặc HTX
        if (deAnDto.DonViThuHuongId != Guid.Empty)
        {
            var dv = await _unitOfWork.DonVis.GetByIdAsync(deAnDto.DonViThuHuongId);
            if (dv == null || string.IsNullOrEmpty(dv.QuyMo) || (!dv.QuyMo.Contains("DNNVV") && !dv.QuyMo.Contains("HTX") && !dv.QuyMo.Contains("Tổ hợp tác")))
            {
                throw new Exception("Đơn vị thụ hưởng bắt buộc phải là DNNVV, Hợp tác xã hoặc Tổ hợp tác (Theo NĐ 45/2012/NĐ-CP).");
            }
        }

        // BUG-01 FIX: Lưu lại HoSoDinhKem cũ trước khi mapper ghi đè
        var hoSoCu = entity.HoSoDinhKem;
        var trangThaiCu = entity.TrangThai;
        var maDeAnCu = entity.MaDeAn;

        _mapper.Map(deAnDto, entity);

        // Khôi phục các trường không được phép thay đổi
        entity.Id = id;
        entity.MaDeAn = maDeAnCu;       // Giữ nguyên mã đề án
        entity.TrangThai = trangThaiCu; // Giữ nguyên trạng thái cũ

        // BUG-01 FIX: Merge HoSoDinhKem — nếu DTO không gửi kèm dữ liệu mới, giữ lại cũ
        if (entity.HoSoDinhKem == null && hoSoCu != null)
        {
            entity.HoSoDinhKem = hoSoCu;
        }
        else if (entity.HoSoDinhKem != null && hoSoCu != null)
        {
            // Merge: ưu tiên giá trị cũ cho các trường quan trọng nếu DTO không gửi
            try
            {
                var newJson = System.Text.Json.Nodes.JsonObject.Parse(entity.HoSoDinhKem.RootElement.GetRawText())!.AsObject();
                var oldJson = System.Text.Json.Nodes.JsonObject.Parse(hoSoCu.RootElement.GetRawText())!.AsObject();

                // Giữ lại fileHoSo cũ nếu dữ liệu mới không có file
                if (!newJson.ContainsKey("fileHoSo") || newJson["fileHoSo"] == null)
                    if (oldJson.ContainsKey("fileHoSo") && oldJson["fileHoSo"] != null)
                        newJson["fileHoSo"] = oldJson["fileHoSo"]!.DeepClone();

                // Giữ lại toạ độ cũ nếu dữ liệu mới không có toạ độ
                if (!newJson.ContainsKey("viDo") || newJson["viDo"] == null)
                    if (oldJson.ContainsKey("viDo") && oldJson["viDo"] != null)
                        newJson["viDo"] = oldJson["viDo"]!.DeepClone();
                if (!newJson.ContainsKey("kinhDo") || newJson["kinhDo"] == null)
                    if (oldJson.ContainsKey("kinhDo") && oldJson["kinhDo"] != null)
                        newJson["kinhDo"] = oldJson["kinhDo"]!.DeepClone();

                entity.HoSoDinhKem = System.Text.Json.JsonDocument.Parse(newJson.ToJsonString());
            }
            catch
            {
                // Nếu merge thất bại, giữ nguyên hồ sơ cũ để an toàn
                entity.HoSoDinhKem = hoSoCu;
            }
        }

        // ⚠️ Convert DateTime về UTC cho PostgreSQL
        if (entity.ThoiGianBatDau.HasValue && entity.ThoiGianBatDau.Value.Kind != DateTimeKind.Utc)
            entity.ThoiGianBatDau = DateTime.SpecifyKind(entity.ThoiGianBatDau.Value, DateTimeKind.Utc);

        if (entity.ThoiGianKetThuc.HasValue && entity.ThoiGianKetThuc.Value.Kind != DateTimeKind.Utc)
            entity.ThoiGianKetThuc = DateTime.SpecifyKind(entity.ThoiGianKetThuc.Value, DateTimeKind.Utc);

        _unitOfWork.DeAns.Update(entity);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    // Overload dư (TrangThaiDeAn enum) đã được xóa theo BUG-02:
    // Mọi thay đổi trạng thái PHẢI đi qua overload có ghiChu + userId
    // để đảm bảo Audit Log đầy đủ theo yêu cầu tài liệu Tuần 1, mục 7.2

    public async Task<bool> QuyetToanAsync(Guid id, Guid userId)
    {
        var deAn = await _unitOfWork.DeAns.GetByIdAsync(id);
        if (deAn == null) return false;

        // BUG-01 FIX: Phải lưu TrangThaiCu TRƯỚC KHI thay đổi TrangThai của Đề án
        // Theo tài liệu Tuần 1 mục 7.2: Audit Log phải phản ánh đúng
        // "từ trạng thái nào" → "sang trạng thái nào"
        var trangThaiCu = deAn.TrangThai;

        deAn.TrangThai = TrangThaiDeAn.DaQuyetToan;
        deAn.UpdatedAt = DateTime.UtcNow;

        var lichSu = new KhuyenCong.Core.Entities.LichSuThaoTac
        {
            Id = Guid.NewGuid(),
            DeAnId = deAn.Id,
            NguoiDungId = userId,
            HanhDong = "Thanh lý Quyết toán",
            TrangThaiCu = trangThaiCu,   // Dùng biến đã lưu trước khi thay đổi
            TrangThaiMoi = TrangThaiDeAn.DaQuyetToan,
            LyDo = "Đã hoàn thành quyết toán dự án.",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _unitOfWork.LichSuThaoTacs.AddAsync(lichSu);

        _unitOfWork.DeAns.Update(deAn);
        return await _unitOfWork.CompleteAsync() > 0;
    }

    public async Task<bool> UpdateStatusAsync(Guid id, int trangThaiMoi, string? ghiChu, Guid? userId = null)
    {
        var entity = await _unitOfWork.DeAns.GetByIdAsync(id);
        if (entity == null) return false;
        var trangThaiCu = entity.TrangThai;

        // C03 FIX: Nếu nộp lại sau khi yêu cầu bổ sung, quay về đúng cấp đã trả về
        if (trangThaiCu == KhuyenCong.Core.Enums.TrangThaiDeAn.YeuCauBoSung && trangThaiMoi == (int)KhuyenCong.Core.Enums.TrangThaiDeAn.ChoSoThamDinh)
        {
            var lichSus = await _unitOfWork.LichSuThaoTacs.FindAsync(x => x.DeAnId == id && x.TrangThaiMoi == KhuyenCong.Core.Enums.TrangThaiDeAn.YeuCauBoSung);
            var lastTraVe = lichSus.OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            if (lastTraVe != null && lastTraVe.TrangThaiCu == KhuyenCong.Core.Enums.TrangThaiDeAn.ChoCucThamDinh)
            {
                trangThaiMoi = (int)KhuyenCong.Core.Enums.TrangThaiDeAn.ChoCucThamDinh;
                if (ghiChu == "Nộp hồ sơ") ghiChu = "Nộp lại hồ sơ bổ sung cho Cục";
            }
        }

        entity.TrangThai = (KhuyenCong.Core.Enums.TrangThaiDeAn)trangThaiMoi;

        if (!string.IsNullOrEmpty(ghiChu))
        {
            entity.GhiChu = ghiChu;
        }

        // M04 FIX: Chặn nộp hồ sơ sau ngày 20/05 hàng năm (ĐÃ BỎ CHẶN CỨNG ĐỂ PHỤC VỤ DEMO)
        if (trangThaiCu == KhuyenCong.Core.Enums.TrangThaiDeAn.BanNhap && trangThaiMoi == (int)KhuyenCong.Core.Enums.TrangThaiDeAn.ChoSoThamDinh)
        {
            var today = DateTime.UtcNow.AddHours(7); // Giờ VN
            if (today.Month > 5 || (today.Month == 5 && today.Day > 20))
            {
                // throw new Exception($"Đã quá thời hạn nộp hồ sơ (Hạn cuối: 20/05/{today.Year}). Vui lòng liên hệ Sở Công Thương để được hỗ trợ.");
            }
        }

        // H05 FIX: Bắt buộc có file hồ sơ khi Nộp hồ sơ
        if (trangThaiMoi == (int)KhuyenCong.Core.Enums.TrangThaiDeAn.ChoSoThamDinh || trangThaiMoi == (int)KhuyenCong.Core.Enums.TrangThaiDeAn.ChoCucThamDinh)
        {
            if (entity.HoSoDinhKem == null)
                throw new Exception("Vui lòng đính kèm ít nhất 01 tệp hồ sơ minh chứng (PDF/Docx) trước khi nộp.");
            
            var hoSoJson = entity.HoSoDinhKem.RootElement;
            bool hasFile = (hoSoJson.ValueKind == System.Text.Json.JsonValueKind.Array && hoSoJson.GetArrayLength() > 0)
                          || (hoSoJson.ValueKind == System.Text.Json.JsonValueKind.Object && hoSoJson.TryGetProperty("fileHoSo", out var f) && f.ValueKind != System.Text.Json.JsonValueKind.Null && !string.IsNullOrEmpty(f.ToString()) && f.ToString() != "{}");
                          
            if (!hasFile)
                throw new Exception("Vui lòng đính kèm ít nhất 01 tệp hồ sơ minh chứng (PDF/Docx) trước khi nộp.");
        }

        // BR-R03 (Tuần 1, mục BR-R03) & BUG-04 FIX: Điều kiện xin Nghiệm thu:
        // Đề án phải có ít nhất 1 báo cáo tiến độ đã nộp
        if (trangThaiMoi == (int)KhuyenCong.Core.Enums.TrangThaiDeAn.DaNghiemThu)
        {
            var baoCaos = await _unitOfWork.TienDoThucHiens.FindAsync(x => x.DeAnId == id);
            var hasAnyBaoCao = baoCaos.Any();
            
            if (!hasAnyBaoCao)
            {
                throw new Exception("Vui lòng nộp ít nhất 1 báo cáo tiến độ thi công trước khi xin nghiệm thu.");
            }

            // MISSING-03 FIX: Lưu URL file Biên bản nghiệm thu vào cột JSONB
            // Theo tài liệu Tuần 1 mục 3.3: BienBanNghiemThu (JSONB) - bắt buộc có file biên bản
            if (!string.IsNullOrEmpty(ghiChu) && ghiChu.StartsWith("http"))
            {
                // ghiChu được truyền là URL file từ Controller endpoint /nghiem-thu
                entity.BienBanNghiemThu = System.Text.Json.JsonDocument.Parse(
                    System.Text.Json.JsonSerializer.Serialize(new
                    {
                        fileUrl = ghiChu,
                        ngayNghiemThu = DateTime.UtcNow.ToString("yyyy-MM-dd")
                    })
                );
            }
        }

        // Lưu vết Audit Log với Ghi chú
        if (userId.HasValue && trangThaiCu != entity.TrangThai)
        {
            var lichSu = new KhuyenCong.Core.Entities.LichSuThaoTac
            {
                Id = Guid.NewGuid(),
                DeAnId = entity.Id,
                NguoiDungId = userId.Value,
                HanhDong = $"Chuyển trạng thái từ {trangThaiCu} sang {entity.TrangThai}",
                TrangThaiCu = trangThaiCu,
                TrangThaiMoi = entity.TrangThai,
                LyDo = ghiChu,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _unitOfWork.LichSuThaoTacs.AddAsync(lichSu);
        }

        // C04 FIX: Tạo Notification cho các user liên quan
        if (trangThaiCu != entity.TrangThai)
        {
            var usersToNotify = new List<Guid>();

            // Nếu đẩy lên Sở (TrangThai = 1, 6) -> Notify Role_So
            if (entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.ChoSoThamDinh || entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DangThucHien)
            {
                var soUsers = await _unitOfWork.NguoiDungs.FindAsync(u => u.Role == KhuyenCong.Core.Enums.RoleType.Role_So || u.Role == KhuyenCong.Core.Enums.RoleType.Role_Admin);
                usersToNotify.AddRange(soUsers.Select(u => u.Id));
            }
            // Nếu đẩy lên Cục/Bộ (TrangThai = 2, 5, 7, 8) -> Notify Role_Bo
            else if (entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.ChoCucThamDinh || entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DaPheDuyet || entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DaNghiemThu || entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.DaQuyetToan)
            {
                var boUsers = await _unitOfWork.NguoiDungs.FindAsync(u => u.Role == KhuyenCong.Core.Enums.RoleType.Role_Bo || u.Role == KhuyenCong.Core.Enums.RoleType.Role_Admin);
                usersToNotify.AddRange(boUsers.Select(u => u.Id));
            }
            // Nếu bị trả về (TrangThai = 3, 4) -> Notify Cơ sở tạo đề án
            else if (entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.YeuCauBoSung || entity.TrangThai == KhuyenCong.Core.Enums.TrangThaiDeAn.BiTuChoi)
            {
                var cosoUsers = await _unitOfWork.NguoiDungs.FindAsync(u => u.DonViId == entity.DonViThuHuongId);
                usersToNotify.AddRange(cosoUsers.Select(u => u.Id));
            }

            foreach (var uid in usersToNotify.Distinct())
            {
                var notif = new KhuyenCong.Core.Entities.Notification
                {
                    Id = Guid.NewGuid(),
                    UserId = uid,
                    TieuDe = $"Đề án: {entity.TenDeAn}",
                    NoiDung = $"Chuyển sang trạng thái: {entity.TrangThai}.{(string.IsNullOrEmpty(ghiChu) ? "" : " Ghi chú: " + ghiChu)}",
                    Type = "System",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Notifications.AddAsync(notif);
            }
        }

        _unitOfWork.DeAns.Update(entity);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
