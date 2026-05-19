namespace KhuyenCong.Core.Enums;

public enum TrangThaiDeAn
{
    BanNhap = 0,               // Bản nháp (Draft)
    ChoSoThamDinh = 1,         // Chờ Sở thẩm định
    ChoCucThamDinh = 2,        // Chờ Cục thẩm định
    YeuCauBoSung = 3,          // Yêu cầu bổ sung
    BiTuChoi = 4,              // Bị từ chối
    DaPheDuyet = 5,            // Đã phê duyệt (Giao kế hoạch)
    DangThucHien = 6,          // Đang thực hiện (Ký hợp đồng & Giải ngân)
    DaNghiemThu = 7,           // Đã nghiệm thu
    DaQuyetToan = 8            // Đã quyết toán (Đóng dự án)
}
