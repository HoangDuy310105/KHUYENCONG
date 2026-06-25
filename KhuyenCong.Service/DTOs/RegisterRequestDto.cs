using System.ComponentModel.DataAnnotations;

namespace KhuyenCong.Service.DTOs;

public class RegisterRequestDto
{
    [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu không được để trống")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên đơn vị không được để trống")]
    public string TenDonVi { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mã số thuế không được để trống")]
    public string MaSoThue { get; set; } = string.Empty;

    public string? DiaChi { get; set; }

    [Range(1, 2, ErrorMessage = "Loại đơn vị không hợp lệ (1: Thụ hưởng, 2: Thi công)")]
    public int LoaiDonVi { get; set; } = 1; // Mặc định là đơn vị thụ hưởng

    public double? ViDo { get; set; }
    public double? KinhDo { get; set; }
}
