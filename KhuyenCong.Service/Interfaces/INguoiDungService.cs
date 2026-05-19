using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface INguoiDungService
{
    // Lấy danh sách toàn bộ người dùng
    Task<IEnumerable<NguoiDungDto>> GetAllAsync();
    
    // Lấy thông tin 1 người dùng theo ID
    Task<NguoiDungDto?> GetByIdAsync(Guid id);
    
    // Tạo tài khoản mới (Có mã hóa mật khẩu)
    Task<NguoiDungDto> CreateAsync(NguoiDungDto dto);
    
    // Cập nhật thông tin (Không bao gồm đổi mật khẩu)
    Task<bool> UpdateAsync(Guid id, NguoiDungDto dto);
    
    // Đổi mật khẩu cho người dùng
    Task<bool> ChangePasswordAsync(Guid id, string newPassword);
    
    // Xóa (Khóa) tài khoản
    Task<bool> DeleteAsync(Guid id);
}
