using KhuyenCong.Service.Interfaces;
using StackExchange.Redis;
using System.Text.Json;
using System.Threading.Tasks;

namespace KhuyenCong.Service.Implementations;

/// <summary>
/// Triển khai dịch vụ Cache sử dụng Redis
/// Áp dụng chiến lược: Cache-Aside (Lazy Loading)
/// Luồng: Đọc từ Redis → Không có → Truy vấn DB → Lưu Redis → Trả về
/// </summary>
public class RedisCacheService : ICacheService
{
    private readonly IDatabase _db;
    private readonly IServer _server;
    private readonly IConnectionMultiplexer _redis;

    public RedisCacheService(IConnectionMultiplexer redis)
    {
        _redis = redis;
        _db = redis.GetDatabase();
        // Lấy Server đầu tiên để hỗ trợ tìm kiếm key theo tiền tố
        var endpoint = redis.GetEndPoints().First();
        _server = redis.GetServer(endpoint);
    }

    /// <summary>
    /// Lấy dữ liệu từ Redis Cache theo khóa
    /// Trả về null nếu không tìm thấy hoặc đã hết hạn
    /// </summary>
    public async Task<T?> GetAsync<T>(string key)
    {
        var json = await _db.StringGetAsync(key);
        if (json.IsNullOrEmpty) return default;

        // Ép kiểu rõ ràng về string để tránh lỗi CS0121 (mơ hồ giữa string và ReadOnlySpan<byte>)
        var jsonString = (string)json!;
        return JsonSerializer.Deserialize<T>(jsonString);
    }

    /// <summary>
    /// Lưu dữ liệu vào Redis với thời gian hết hạn
    /// Mặc định: Hết hạn sau 30 phút
    /// </summary>
    public async Task SetAsync<T>(string key, T value, int expiryMinutes = 30)
    {
        var json = JsonSerializer.Serialize(value);
        await _db.StringSetAsync(key, json, TimeSpan.FromMinutes(expiryMinutes));
    }

    /// <summary>
    /// Xóa 1 key khỏi Redis
    /// Gọi hàm này khi dữ liệu trong DB thay đổi (Thêm/Sửa/Xóa)
    /// </summary>
    public async Task RemoveAsync(string key)
    {
        await _db.KeyDeleteAsync(key);
    }

    /// <summary>
    /// Xóa toàn bộ key có cùng tiền tố
    /// Ví dụ: Xóa "linhvuc:*" để làm mới toàn bộ cache lĩnh vực
    /// </summary>
    public async Task RemoveByPrefixAsync(string prefix)
    {
        // Tìm tất cả key có tiền tố tương ứng
        var keys = _server.Keys(pattern: $"{prefix}*").ToArray();
        if (keys.Any())
        {
            await _db.KeyDeleteAsync(keys);
        }
    }
}
