namespace KhuyenCong.Core.Enums;

/// <summary>
/// Trạng thái của Sản phẩm OCOP / CNNT Tiêu biểu trong quy trình bình chọn
/// Theo tài liệu V2 mục "Quản lý sản phẩm nông nghiệp nông thôn tiêu biểu"
/// và Tuần 1 mục 8.1
/// </summary>
public enum TrangThaiSanPhamOcop
{
    /// <summary>
    /// Bản nháp — chưa nộp đăng ký dự thi (CNNT đang soạn thảo)
    /// </summary>
    BanNhap = 0,

    /// <summary>
    /// Đã đăng ký dự thi — chưa có kết quả bình chọn
    /// </summary>
    DangKyDuThi = 1,

    /// <summary>
    /// Đạt bình chọn — sản phẩm được công nhận OCOP/CNNT Tiêu biểu
    /// Lưu vào DB: PhanHangSao (3 sao, 4 sao, 5 sao) và QuyetDinhCongNhan
    /// </summary>
    DatBinhChon = 2,

    /// <summary>
    /// Không đạt — không được công nhận trong đợt bình chọn này
    /// </summary>
    KhongDat = 3
}
