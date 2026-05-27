using System;
using System.Threading.Tasks;
using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Data.Context;

namespace KhuyenCong.Data.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly KhuyenCongDbContext _context;

    public UnitOfWork(KhuyenCongDbContext context)
    {
        _context = context;
        DeAns = new Repository<DeAn>(_context);
        DonVis = new Repository<DonVi>(_context);
        LinhVucs = new Repository<LinhVuc>(_context);
        LoaiDeAns = new Repository<LoaiDeAn>(_context);
        NguoiDungs = new Repository<NguoiDung>(_context);
        GiaiNgans = new Repository<GiaiNgan>(_context);
        TienDoThucHiens = new Repository<TienDoThucHien>(_context);
        LichSuThaoTacs = new Repository<LichSuThaoTac>(_context);
        SanPhamOcops = new Repository<SanPhamOcop>(_context);
    }

    public IRepository<DeAn> DeAns { get; private set; }
    public IRepository<DonVi> DonVis { get; private set; }
    public IRepository<LinhVuc> LinhVucs { get; private set; }
    public IRepository<LoaiDeAn> LoaiDeAns { get; private set; }
    public IRepository<NguoiDung> NguoiDungs { get; private set; }
    public IRepository<GiaiNgan> GiaiNgans { get; private set; }
    public IRepository<TienDoThucHien> TienDoThucHiens { get; private set; }
    public IRepository<LichSuThaoTac> LichSuThaoTacs { get; private set; }
    public IRepository<SanPhamOcop> SanPhamOcops { get; private set; }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
