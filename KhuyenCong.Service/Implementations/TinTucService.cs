using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.Service.Implementations;

public class TinTucService : ITinTucService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TinTucService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<(IEnumerable<TinTucDto> Items, int TotalCount)> GetPagedAsync(int pageIndex, int pageSize, string? keyword = null, string? category = null)
    {
        Expression<Func<TinTuc, bool>> filter = x => 
            (string.IsNullOrEmpty(keyword) || x.Title.ToLower().Contains(keyword.ToLower()) || x.Excerpt.ToLower().Contains(keyword.ToLower())) &&
            (string.IsNullOrEmpty(category) || category == "Tất cả" || x.Category == category);

        // Sorting is missing in GetPagedAsync of Generic Repository, but we'll adapt.
        var (items, totalCount) = await _unitOfWork.TinTucs.GetPagedAsync(pageIndex, pageSize, filter);

        var dtos = _mapper.Map<IEnumerable<TinTucDto>>(items);
        return (dtos, totalCount);
    }

    public async Task<TinTucDto?> GetByIdAsync(Guid id)
    {
        var entity = await _unitOfWork.TinTucs.GetByIdAsync(id);
        if (entity == null) return null;
        return _mapper.Map<TinTucDto>(entity);
    }

    public async Task<TinTucDto> CreateAsync(CreateTinTucDto request)
    {
        var entity = _mapper.Map<TinTuc>(request);
        entity.PublishedAt = DateTime.UtcNow;

        await _unitOfWork.TinTucs.AddAsync(entity);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<TinTucDto>(entity);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateTinTucDto request)
    {
        var entity = await _unitOfWork.TinTucs.GetByIdAsync(id);
        if (entity == null) return false;

        _mapper.Map(request, entity);
        
        _unitOfWork.TinTucs.Update(entity);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _unitOfWork.TinTucs.GetByIdAsync(id);
        if (entity == null) return false;

        _unitOfWork.TinTucs.Remove(entity);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<bool> IncrementViewCountAsync(Guid id)
    {
        var entity = await _unitOfWork.TinTucs.GetByIdAsync(id);
        if (entity == null) return false;

        entity.Views += 1;
        _unitOfWork.TinTucs.Update(entity);
        await _unitOfWork.CompleteAsync();

        return true;
    }
}
