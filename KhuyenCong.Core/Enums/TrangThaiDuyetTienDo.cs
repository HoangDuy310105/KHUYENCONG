namespace KhuyenCong.Core.Enums;

/// <summary>
/// Trạng thái của Báo cáo tiến độ (Tiến độ thực hiện)
/// </summary>
public enum TrangThaiDuyetTienDo
{
    /// <summary>
    /// Cơ sở vừa nộp, đang chờ Cán bộ Sở/TTKC đi kiểm tra thực địa
    /// </summary>
    ChoKiemTra = 0,

    /// <summary>
    /// Đã kiểm tra nhưng có sai phạm/thiếu hồ sơ, yêu cầu cơ sở bổ sung
    /// </summary>
    YeuCauBoSung = 1,

    /// <summary>
    /// Đã được Lãnh đạo Sở phê duyệt thành công
    /// </summary>
    DaPheDuyet = 2
}
