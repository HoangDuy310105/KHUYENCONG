using AutoMapper;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace KhuyenCong.Service.Implementations;

/// <summary>
/// Service xử lý nghiệp vụ Lĩnh vực khuyến công
/// Áp dụng chiến lược Cache-Aside với Redis để tăng hiệu suất
/// </summary>
public class LinhVucService : ILinhVucService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICacheService _cache;

    // Khóa cache cố định — Dùng để lưu và xóa cache lĩnh vực
    private const string CACHE_KEY_ALL = "linhvuc:all";

    public LinhVucService(IUnitOfWork unitOfWork, IMapper mapper, ICacheService cache)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _cache = cache;
    }

    /// <summary>
    /// Lấy toàn bộ danh sách lĩnh vực
    /// Chiến lược: Đọc Redis → Không có → Truy vấn DB → Lưu Redis 60 phút → Trả về
    /// </summary>
    public async Task<IEnumerable<LinhVucDto>> GetAllAsync()
    {
        // Bước 1: Kiểm tra cache Redis trước
        var cached = await _cache.GetAsync<IEnumerable<LinhVucDto>>(CACHE_KEY_ALL);
        if (cached != null)
        {
            // Cache hit — Trả về ngay, không truy vấn DB
            return cached;
        }

        // Bước 2: Cache miss — Truy vấn từ PostgreSQL
        var entities = await _unitOfWork.LinhVucs.GetAllAsync();
        var result = _mapper.Map<IEnumerable<LinhVucDto>>(entities);

        // Bước 3: Lưu kết quả vào Redis 60 phút
        // (Danh sách lĩnh vực ít thay đổi nên cache lâu hơn)
        await _cache.SetAsync(CACHE_KEY_ALL, result, expiryMinutes: 60);

        return result;
    }

    public async Task<LinhVucDto?> GetByIdAsync(System.Guid id)
    {
        var entity = await _unitOfWork.LinhVucs.GetByIdAsync(id);
        if (entity == null) return null;
        return _mapper.Map<LinhVucDto>(entity);
    }

    public async Task<LinhVucDto> CreateAsync(LinhVucDto linhVucDto)
    {
        var entity = _mapper.Map<KhuyenCong.Core.Entities.LinhVuc>(linhVucDto);
        await _unitOfWork.LinhVucs.AddAsync(entity);
        await _unitOfWork.CompleteAsync();
        await _cache.RemoveAsync(CACHE_KEY_ALL); // Clear cache
        return _mapper.Map<LinhVucDto>(entity);
    }

    public async Task<bool> UpdateAsync(System.Guid id, LinhVucDto linhVucDto)
    {
        var entity = await _unitOfWork.LinhVucs.GetByIdAsync(id);
        if (entity == null) return false;

        _mapper.Map(linhVucDto, entity);
        _unitOfWork.LinhVucs.Update(entity);
        await _unitOfWork.CompleteAsync();
        await _cache.RemoveAsync(CACHE_KEY_ALL); // Clear cache
        return true;
    }

    public async Task<bool> DeleteAsync(System.Guid id)
    {
        var entity = await _unitOfWork.LinhVucs.GetByIdAsync(id);
        if (entity == null) return false;

        _unitOfWork.LinhVucs.Remove(entity);
        await _unitOfWork.CompleteAsync();
        await _cache.RemoveAsync(CACHE_KEY_ALL); // Clear cache
        return true;
    }
}
