using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KhuyenCong.Core.DTOs;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Service.Interfaces;

namespace KhuyenCong.Service.Implementations;

public class LichSuThaoTacService : ILichSuThaoTacService
{
    private readonly IUnitOfWork _unitOfWork;

    public LichSuThaoTacService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<LichSuThaoTacDto>> GetAllAsync()
    {
        var logs = await _unitOfWork.LichSuThaoTacs.GetAllAsync(includeProperties: "DeAn,NguoiDung");

        return logs.OrderByDescending(l => l.CreatedAt).Select(l => new LichSuThaoTacDto
        {
            Id = l.Id,
            DeAnId = l.DeAnId,
            TenDeAn = l.DeAn?.TenDeAn,
            NguoiDungId = l.NguoiDungId,
            TenNguoiDung = l.NguoiDung?.Username ?? "Hệ thống",
            HanhDong = l.HanhDong,
            TrangThaiCu = l.TrangThaiCu,
            TrangThaiMoi = l.TrangThaiMoi,
            LyDo = l.LyDo,
            CreatedAt = l.CreatedAt
        });
    }
}
