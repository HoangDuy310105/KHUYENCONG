using System.Threading.Tasks;

namespace KhuyenCong.Service.Interfaces;

/// <summary>
/// Interface định nghĩa hợp đồng cho dịch vụ Cache (Redis)
/// Giúp dễ dàng thay thế Redis bằng bất kỳ hệ thống cache nào khác
/// </summary>
public interface ICacheService
{
    /// <summary>Lấy dữ liệu từ Cache theo khóa</summary>
    Task<T?> GetAsync<T>(string key);

    /// <summary>Lưu dữ liệu vào Cache với thời gian hết hạn tùy chỉnh</summary>
    Task SetAsync<T>(string key, T value, int expiryMinutes = 30);

    /// <summary>Xóa dữ liệu khỏi Cache (Dùng khi dữ liệu gốc bị thay đổi)</summary>
    Task RemoveAsync(string key);

    /// <summary>Xóa toàn bộ Cache theo tiền tố khóa (Ví dụ: Xóa tất cả cache của "linhvuc")</summary>
    Task RemoveByPrefixAsync(string prefix);
}
