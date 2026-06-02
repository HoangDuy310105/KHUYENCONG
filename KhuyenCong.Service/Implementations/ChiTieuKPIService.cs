using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using KhuyenCong.Core.Entities;
using KhuyenCong.Data.Context;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.Service.Implementations;

public class ChiTieuKPIService : IChiTieuKPIService
{
    private readonly KhuyenCongDbContext _context;

    public ChiTieuKPIService(KhuyenCongDbContext context)
    {
        _context = context;
    }

    public async Task<ChiTieuKPIDto?> GetByDeAnIdAsync(Guid deAnId)
    {
        var entity = await _context.Set<ChiTieuKPI>().FirstOrDefaultAsync(x => x.DeAnId == deAnId);
        if (entity == null) return null;

        return new ChiTieuKPIDto
        {
            Id = entity.Id,
            DeAnId = entity.DeAnId,
            ThongKeHieuQua = entity.ThongKeHieuQua
        };
    }

    public async Task<ChiTieuKPIDto> SaveAsync(CreateChiTieuKPIDto dto)
    {
        var entity = await _context.Set<ChiTieuKPI>().FirstOrDefaultAsync(x => x.DeAnId == dto.DeAnId);
        if (entity == null)
        {
            entity = new ChiTieuKPI
            {
                DeAnId = dto.DeAnId,
                ThongKeHieuQua = dto.ThongKeHieuQua
            };
            _context.Set<ChiTieuKPI>().Add(entity);
        }
        else
        {
            entity.ThongKeHieuQua = dto.ThongKeHieuQua;
            _context.Set<ChiTieuKPI>().Update(entity);
        }

        await _context.SaveChangesAsync();

        return new ChiTieuKPIDto
        {
            Id = entity.Id,
            DeAnId = entity.DeAnId,
            ThongKeHieuQua = entity.ThongKeHieuQua
        };
    }
}
