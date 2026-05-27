using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Interfaces;

public interface IGiaiNganService
{
    /// <summary>Lấy danh sách tất cả đề án kèm thông tin tóm tắt giải ngân (cho trang Kinh phí)</summary>
    Task<IEnumerable<DeAnGiaiNganSummaryDto>> GetDeAnGiaiNganSummaryAsync();
    
    /// <summary>Lấy lịch sử giải ngân của một đề án cụ thể</summary>
    Task<IEnumerable<GiaiNganDto>> GetByDeAnIdAsync(Guid deAnId);
    
    /// <summary>Tạo mới một đợt giải ngân (Tạm ứng hoặc Quyết toán)</summary>
    Task<GiaiNganDto> CreateAsync(GiaiNganCreateDto dto);
    
    /// <summary>Xóa một đợt giải ngân (Admin only)</summary>
    Task<bool> DeleteAsync(Guid id);
}
