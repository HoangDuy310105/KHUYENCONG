using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.Service.Implementations;

public class LoaiDeAnService : ILoaiDeAnService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public LoaiDeAnService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<LoaiDeAnDto>> GetAllAsync()
    {
        var entities = await _unitOfWork.LoaiDeAns.GetAllAsync();
        return _mapper.Map<IEnumerable<LoaiDeAnDto>>(entities);
    }

    public async Task<LoaiDeAnDto?> GetByIdAsync(Guid id)
    {
        var entity = await _unitOfWork.LoaiDeAns.GetByIdAsync(id);
        return _mapper.Map<LoaiDeAnDto>(entity);
    }

    public async Task<LoaiDeAnDto> CreateAsync(LoaiDeAnDto loaiDeAnDto)
    {
        var entity = _mapper.Map<LoaiDeAn>(loaiDeAnDto);
        await _unitOfWork.LoaiDeAns.AddAsync(entity);
        await _unitOfWork.CompleteAsync();
        return _mapper.Map<LoaiDeAnDto>(entity);
    }

    public async Task<bool> UpdateAsync(Guid id, LoaiDeAnDto loaiDeAnDto)
    {
        var existing = await _unitOfWork.LoaiDeAns.GetByIdAsync(id);
        if (existing == null) return false;

        _mapper.Map(loaiDeAnDto, existing);
        existing.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.LoaiDeAns.Update(existing);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _unitOfWork.LoaiDeAns.GetByIdAsync(id);
        if (existing == null) return false;

        _unitOfWork.LoaiDeAns.Remove(existing);
        await _unitOfWork.CompleteAsync();
        return true;
    }
}
