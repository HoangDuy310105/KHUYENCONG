using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace KhuyenCong.Service.Helpers;

public static class GeocodingHelper
{
    public static async Task<(double? lat, double? lon)> GetCoordinatesAsync(string address)
    {
        if (string.IsNullOrWhiteSpace(address)) return (null, null);

        var parts = address.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        using var client = new HttpClient();
        client.Timeout = TimeSpan.FromSeconds(3); // Giới hạn 3s để tránh treo server nếu Nominatim lỗi
        client.DefaultRequestHeaders.Add("User-Agent", "KhuyenCongApp/1.0 (admin@khuyencong.vn)");

        // Thử dần từ địa chỉ dài nhất, sau đó cắt dần phần đầu (số nhà, phường/xã)
        for (int i = 0; i < parts.Length; i++)
        {
            var currentQuery = string.Join(", ", parts.Skip(i));
            if (string.IsNullOrWhiteSpace(currentQuery)) continue;

            try
            {
                var url = $"https://nominatim.openstreetmap.org/search?format=json&limit=1&q={Uri.EscapeDataString(currentQuery)}";
                var response = await client.GetAsync(url);
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    var root = doc.RootElement;
                    if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0)
                    {
                        var firstMatch = root[0];
                        if (firstMatch.TryGetProperty("lat", out var latProp) && 
                            firstMatch.TryGetProperty("lon", out var lonProp))
                        {
                            var latStr = latProp.GetString();
                            var lonStr = lonProp.GetString();
                            if (double.TryParse(latStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var lat) &&
                                double.TryParse(lonStr, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var lon))
                            {
                                return (lat, lon);
                            }
                        }
                    }
                }
            }
            catch
            {
                // Bỏ qua lỗi mạng cục bộ của lần thử này
            }
        }

        return (null, null);
    }
}
