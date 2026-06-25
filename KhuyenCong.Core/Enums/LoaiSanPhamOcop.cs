namespace KhuyenCong.Core.Enums;

/// <summary>
/// Phân loại sản phẩm trong module OCOP/CNNT Tiêu biểu
/// Theo tài liệu Tuần 1, mục 8.1 (Phân hệ 8: Xúc tiến thương mại & Sản phẩm tiêu biểu)
/// </summary>
public enum LoaiSanPhamOcop
{
    /// <summary>
    /// Sản phẩm OCOP (Mỗi xã một sản phẩm) — đã xếp hạng sao
    /// </summary>
    OCOP = 1,

    /// <summary>
    /// Sản phẩm Công nghiệp nông thôn tiêu biểu (CNNT Tiêu biểu)
    /// Theo Điều 4 Nghị định 45/2012/NĐ-CP: "Phát triển sản phẩm công nghiệp nông thôn tiêu biểu"
    /// </summary>
    CNNTTieuBieu = 2
}
