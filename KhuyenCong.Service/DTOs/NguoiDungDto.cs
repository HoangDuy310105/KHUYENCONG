using System;

namespace KhuyenCong.Service.DTOs;

public class NguoiDungDto
{
    public Guid Id { get; set; }
    
    // Tên đăng nhập
    public string Username { get; set; } = string.Empty;
    
    // Lưu ý: Không trả về PasswordHash ra ngoài để bảo mật
    // Khi tạo mới từ Client truyền lên, trường này sẽ chứa mật khẩu dạng rõ (Plain text)
    public string? Password { get; set; } 
    
    // Quyền hạn (Enum RoleType)
    public int Role { get; set; }
    
    // ID của Đơn vị mà người dùng này trực thuộc
    public Guid? DonViId { get; set; }
    
    // Tên Đơn vị liên kết
    public string? TenDonVi { get; set; }
    
    // Trạng thái khóa tài khoản
    public bool IsActive { get; set; }
}
