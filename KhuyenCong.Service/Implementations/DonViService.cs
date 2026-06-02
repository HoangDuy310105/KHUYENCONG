using AutoMapper;
using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace KhuyenCong.Service.Implementations;

/// <summary>
/// Lớp xử lý toàn bộ nghiệp vụ liên quan đến Đơn Vị (Doanh nghiệp, Sở, Cục...).
/// Sử dụng AutoMapper để chuyển đổi giữa Entity và DTO.
/// </summary>
public class DonViService : IDonViService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DonViService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    /// <summary>
    /// Lấy danh sách đơn vị có hỗ trợ phân trang và tìm kiếm theo từ khóa.
    /// Tìm kiếm không phân biệt hoa/thường theo Tên đơn vị hoặc Mã số thuế.
    /// </summary>
    /// <param name="page">Số trang hiện tại (bắt đầu từ 1).</param>
    /// <param name="pageSize">Số bản ghi tối đa mỗi trang.</param>
    /// <param name="search">Từ khóa tìm kiếm (Tên đơn vị hoặc Mã số thuế).</param>
    public async Task<(IEnumerable<DonViDto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? search)
    {
        System.Linq.Expressions.Expression<Func<DonVi, bool>>? filter = null;

        // Nếu có từ khóa tìm kiếm, xây dựng bộ lọc so khớp với Tên đơn vị hoặc Mã số thuế
        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            filter = d => d.TenDonVi.ToLower().Contains(searchLower) || d.MaSoThue.Contains(searchLower);
        }

        // Truy vấn phân trang trực tiếp trên Database (chỉ tải đúng số bản ghi cần thiết)
        var (items, totalCount) = await _unitOfWork.DonVis.GetPagedAsync(page, pageSize, filter);
        return (_mapper.Map<IEnumerable<DonViDto>>(items), totalCount);
    }

    /// <summary>
    /// Lấy thông tin chi tiết của một đơn vị theo ID.
    /// Trả về null nếu không tìm thấy.
    /// </summary>
    public async Task<DonViDto?> GetByIdAsync(Guid id)
    {
        var entity = await _unitOfWork.DonVis.GetByIdAsync(id);
        return _mapper.Map<DonViDto>(entity);
    }

    /// <summary>
    /// Tạo mới hồ sơ đơn vị và lưu vào cơ sở dữ liệu.
    /// </summary>
    public async Task<DonViDto> CreateAsync(DonViDto donViDto)
    {
        // Chuyển đổi DTO thành Entity trước khi ghi vào DB
        var entity = _mapper.Map<DonVi>(donViDto);
        await _unitOfWork.DonVis.AddAsync(entity);
        await _unitOfWork.CompleteAsync(); // Xác nhận giao dịch
        return _mapper.Map<DonViDto>(entity);
    }

    /// <summary>
    /// Cập nhật thông tin hồ sơ đơn vị theo ID.
    /// Trả về false nếu không tìm thấy đơn vị cần cập nhật.
    /// </summary>
    public async Task<bool> UpdateAsync(Guid id, DonViDto donViDto)
    {
        var existing = await _unitOfWork.DonVis.GetByIdAsync(id);
        if (existing == null) return false; // Không tìm thấy đơn vị

        // Cập nhật dữ liệu từ DTO vào Entity đang được theo dõi bởi EF Core
        _mapper.Map(donViDto, existing);
        existing.UpdatedAt = DateTime.UtcNow; // Ghi nhận thời điểm cập nhật

        _unitOfWork.DonVis.Update(existing);
        await _unitOfWork.CompleteAsync(); // Xác nhận giao dịch
        return true;
    }

    /// <summary>
    /// Xóa hồ sơ đơn vị khỏi cơ sở dữ liệu theo ID.
    /// Chỉ có Admin mới có quyền gọi hàm này (được kiểm soát ở tầng Controller).
    /// Trả về false nếu không tìm thấy đơn vị cần xóa.
    /// </summary>
    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _unitOfWork.DonVis.GetByIdAsync(id);
        if (existing == null) return false; // Không tìm thấy đơn vị

        _unitOfWork.DonVis.Remove(existing);
        await _unitOfWork.CompleteAsync(); // Xác nhận giao dịch
        return true;
    }

    /// <summary>
    /// Xuất toàn bộ danh sách đơn vị ra file Excel (.xlsx).
    /// File được sinh ra trên RAM (MemoryStream) và trả về dưới dạng mảng Byte,
    /// không lưu file rác lên ổ cứng của server.
    /// </summary>
    public async Task<byte[]> ExportExcelAsync()
    {
        // Lấy toàn bộ danh sách đơn vị từ Database
        var entities = await _unitOfWork.DonVis.GetAllAsync();

        using var workbook = new ClosedXML.Excel.XLWorkbook();
        var worksheet = workbook.Worksheets.Add("DanhSachDonVi");

        // Ghi dòng tiêu đề (Header)
        worksheet.Cell(1, 1).Value = "Mã số thuế";
        worksheet.Cell(1, 2).Value = "Tên đơn vị";
        worksheet.Cell(1, 3).Value = "Địa chỉ";
        worksheet.Cell(1, 4).Value = "Điện thoại";

        // Ghi từng dòng dữ liệu (bắt đầu từ dòng 2 sau Header)
        int row = 2;
        foreach (var item in entities)
        {
            worksheet.Cell(row, 1).Value = item.MaSoThue;
            worksheet.Cell(row, 2).Value = item.TenDonVi;
            worksheet.Cell(row, 3).Value = item.DiaChi;
            worksheet.Cell(row, 4).Value = item.SoDienThoai;
            row++;
        }

        // Lưu workbook vào MemoryStream và trả về mảng byte
        using var stream = new System.IO.MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    /// <summary>
    /// Nhập danh sách đơn vị hàng loạt từ file Excel (.xlsx) do người dùng tải lên.
    /// Tự động bỏ qua dòng tiêu đề và các dòng không có Mã số thuế.
    /// Trả về số lượng bản ghi đã được nhập thành công vào Database.
    /// </summary>
    public async Task<int> ImportExcelAsync(System.IO.Stream stream)
    {
        using var workbook = new ClosedXML.Excel.XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1); // Đọc sheet đầu tiên trong file
        var rangeUsed = worksheet.RangeUsed();
        if (rangeUsed == null) return 0;
        var rows = rangeUsed.RowsUsed();

        var newEntities = new List<DonVi>();
        bool isFirstRow = true;

        foreach (var row in rows)
        {
            // Bỏ qua dòng đầu tiên vì đó là dòng tiêu đề (Header)
            if (isFirstRow) { isFirstRow = false; continue; }

            var maSoThue = row.Cell(1).GetString();

            // Bỏ qua các dòng trống không có Mã số thuế
            if (string.IsNullOrWhiteSpace(maSoThue)) continue;

            // Đọc dữ liệu từng cột và tạo Entity mới
            newEntities.Add(new DonVi
            {
                MaSoThue = maSoThue,
                TenDonVi = row.Cell(2).GetString(),
                DiaChi = row.Cell(3).GetString(),
                SoDienThoai = row.Cell(4).GetString()
            });
        }

        // Chỉ thực hiện ghi DB nếu có ít nhất 1 bản ghi hợp lệ
        if (newEntities.Count > 0)
        {
            await _unitOfWork.DonVis.AddRangeAsync(newEntities);
            await _unitOfWork.CompleteAsync(); // Xác nhận toàn bộ giao dịch
        }

        return newEntities.Count;
    }
}
