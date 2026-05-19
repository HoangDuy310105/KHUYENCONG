using System;
using System.Net.Http;
using System.Threading.Tasks;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.Service.Implementations;

public class DiaDiemService : IDiaDiemService
{
    private readonly HttpClient _httpClient;
    private readonly ICacheService _cacheService;

    public DiaDiemService(HttpClient httpClient, ICacheService cacheService)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://provinces.open-api.vn/api/");
        _cacheService = cacheService;
    }

    public async Task<string> GetTinhThanhAsync()
    {
        var cacheKey = "DiaDiem:TinhThanh";
        var cached = await _cacheService.GetAsync<string>(cacheKey);
        if (!string.IsNullOrEmpty(cached)) return cached;

        var response = await _httpClient.GetAsync("p");
        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadAsStringAsync();

        await _cacheService.SetAsync(cacheKey, data, 43200); // 30 days
        return data;
    }

    public async Task<string> GetQuanHuyenAsync(string maTinh)
    {
        var cacheKey = $"DiaDiem:Huyen:{maTinh}";
        var cached = await _cacheService.GetAsync<string>(cacheKey);
        if (!string.IsNullOrEmpty(cached)) return cached;

        var response = await _httpClient.GetAsync($"p/{maTinh}?depth=2");
        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadAsStringAsync();

        await _cacheService.SetAsync(cacheKey, data, 43200);
        return data;
    }

    public async Task<string> GetPhuongXaAsync(string maHuyen)
    {
        var cacheKey = $"DiaDiem:Xa:{maHuyen}";
        var cached = await _cacheService.GetAsync<string>(cacheKey);
        if (!string.IsNullOrEmpty(cached)) return cached;

        var response = await _httpClient.GetAsync($"d/{maHuyen}?depth=2");
        response.EnsureSuccessStatusCode();
        var data = await response.Content.ReadAsStringAsync();

        await _cacheService.SetAsync(cacheKey, data, 43200);
        return data;
    }
}
