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

public class VanBanService : IVanBanService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public VanBanService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<(IEnumerable<VanBanDto> Items, int TotalCount)> GetPagedAsync(int page, int pageSize, string? keyword = null, int? loaiTaiLieu = null)
    {
        Expression<Func<VanBanPhapLuat, bool>> filter = x => 
            (string.IsNullOrEmpty(keyword) || x.SoKyHieu.ToLower().Contains(keyword.ToLower()) || x.TrichYeu.ToLower().Contains(keyword.ToLower())) &&
            (!loaiTaiLieu.HasValue || x.LoaiTaiLieu == loaiTaiLieu.Value);

        var (items, totalCount) = await _unitOfWork.VanBanPhapLuats.GetPagedAsync(page, pageSize, filter);

        var dtos = _mapper.Map<IEnumerable<VanBanDto>>(items);
        return (dtos, totalCount);
    }

    public async Task<VanBanDto?> GetByIdAsync(Guid id)
    {
        var entity = await _unitOfWork.VanBanPhapLuats.GetByIdAsync(id);
        if (entity == null) return null;

        return _mapper.Map<VanBanDto>(entity);
    }

    public async Task<VanBanDto> CreateAsync(VanBanDto vanBanDto)
    {
        // Check unique SoKyHieu
        var existing = await _unitOfWork.VanBanPhapLuats
            .FindAsync(x => x.SoKyHieu.ToLower() == vanBanDto.SoKyHieu.ToLower());
            
        if (existing.Any())
        {
            throw new Exception("Số/Ký hiệu văn bản đã tồn tại trong hệ thống.");
        }

        var entity = _mapper.Map<VanBanPhapLuat>(vanBanDto);
        
        if (entity.NgayHieuLuc.HasValue && entity.NgayHieuLuc.Value.Kind != DateTimeKind.Utc)
        {
            entity.NgayHieuLuc = DateTime.SpecifyKind(entity.NgayHieuLuc.Value, DateTimeKind.Utc);
        }

        await _unitOfWork.VanBanPhapLuats.AddAsync(entity);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<VanBanDto>(entity);
    }

    public async Task<bool> UpdateAsync(Guid id, VanBanDto vanBanDto)
    {
        var entity = await _unitOfWork.VanBanPhapLuats.GetByIdAsync(id);
        if (entity == null) return false;

        // Check unique SoKyHieu but ignore current id
        var existing = await _unitOfWork.VanBanPhapLuats
            .FindAsync(x => x.SoKyHieu.ToLower() == vanBanDto.SoKyHieu.ToLower() && x.Id != id);
            
        if (existing.Any())
        {
            throw new Exception("Số/Ký hiệu văn bản đã tồn tại trong hệ thống.");
        }

        entity.SoKyHieu = vanBanDto.SoKyHieu;
        entity.TrichYeu = vanBanDto.TrichYeu;
        
        if (vanBanDto.NgayHieuLuc.HasValue)
        {
            entity.NgayHieuLuc = DateTime.SpecifyKind(vanBanDto.NgayHieuLuc.Value, DateTimeKind.Utc);
        }
        else
        {
            entity.NgayHieuLuc = null;
        }

        entity.TrangThai = (KhuyenCong.Core.Enums.TrangThaiVanBan)vanBanDto.TrangThai;
        entity.LoaiTaiLieu = vanBanDto.LoaiTaiLieu;
        
        if (!string.IsNullOrEmpty(vanBanDto.FileDinhKem))
        {
            entity.FileDinhKem = vanBanDto.FileDinhKem;
        }

        _unitOfWork.VanBanPhapLuats.Update(entity);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _unitOfWork.VanBanPhapLuats.GetByIdAsync(id);
        if (entity == null) return false;

        _unitOfWork.VanBanPhapLuats.Remove(entity);
        await _unitOfWork.CompleteAsync();

        return true;
    }
}
