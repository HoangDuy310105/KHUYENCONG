using System;
using System.Threading.Tasks;
using KhuyenCong.Core.Entities;

namespace KhuyenCong.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<DeAn> DeAns { get; }
    IRepository<DonVi> DonVis { get; }
    IRepository<LinhVuc> LinhVucs { get; }
    IRepository<LoaiDeAn> LoaiDeAns { get; }
    IRepository<NguoiDung> NguoiDungs { get; }
    IRepository<GiaiNgan> GiaiNgans { get; }
    IRepository<TienDoThucHien> TienDoThucHiens { get; }
    IRepository<LichSuThaoTac> LichSuThaoTacs { get; }
    IRepository<SanPhamOcop> SanPhamOcops { get; }

    Task<int> CompleteAsync();
}
