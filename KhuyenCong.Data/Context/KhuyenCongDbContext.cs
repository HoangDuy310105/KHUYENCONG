using KhuyenCong.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace KhuyenCong.Data.Context;

public class KhuyenCongDbContext : DbContext
{
    public KhuyenCongDbContext(DbContextOptions<KhuyenCongDbContext> options) : base(options) { }

    public DbSet<NguoiDung> NguoiDungs => Set<NguoiDung>();
    public DbSet<DonVi> DonVis => Set<DonVi>();
    public DbSet<LinhVuc> LinhVucs => Set<LinhVuc>();
    public DbSet<LoaiDeAn> LoaiDeAns => Set<LoaiDeAn>();
    public DbSet<DeAn> DeAns => Set<DeAn>();
    public DbSet<GiaiNgan> GiaiNgans => Set<GiaiNgan>();
    public DbSet<TienDoThucHien> TienDoThucHiens => Set<TienDoThucHien>();
    public DbSet<ChiTieuKPI> ChiTieuKPIs => Set<ChiTieuKPI>();
    public DbSet<SanPhamOcop> SanPhamOcops => Set<SanPhamOcop>();
    public DbSet<LichSuThaoTac> LichSuThaoTacs => Set<LichSuThaoTac>();
    public DbSet<VanBanPhapLuat> VanBanPhapLuats => Set<VanBanPhapLuat>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. RÀNG BUỘC CÁC MỐI QUAN HỆ CHẶT CHẼ (CHỐNG XÓA NHẦM)
        
        // DeAn -> DonVi (Thu Huong)
        modelBuilder.Entity<DeAn>()
            .HasOne(d => d.DonViThuHuong)
            .WithMany(dv => dv.DeAnThuHuongs)
            .HasForeignKey(d => d.DonViThuHuongId)
            .OnDelete(DeleteBehavior.Restrict); // Không cho phép xóa Đơn vị nếu Đề án đang tồn tại

        // DeAn -> DonVi (Thi Cong)
        modelBuilder.Entity<DeAn>()
            .HasOne(d => d.DonViThiCong)
            .WithMany(dv => dv.DeAnThiCongs)
            .HasForeignKey(d => d.DonViThiCongId)
            .OnDelete(DeleteBehavior.Restrict);

        // DeAn -> DonVi (Giam Sat)
        modelBuilder.Entity<DeAn>()
            .HasOne(d => d.DonViGiamSat)
            .WithMany() // We don't necessarily need a collection on DonVi for this, or we can just use WithMany()
            .HasForeignKey(d => d.DonViGiamSatId)
            .OnDelete(DeleteBehavior.Restrict);

        // NguoiDung -> DonVi
        modelBuilder.Entity<NguoiDung>()
            .HasOne(n => n.DonVi)
            .WithMany(dv => dv.NguoiDungs)
            .HasForeignKey(n => n.DonViId)
            .OnDelete(DeleteBehavior.Restrict);

        // DeAn -> LinhVuc
        modelBuilder.Entity<DeAn>()
            .HasOne(d => d.LinhVuc)
            .WithMany(l => l.DeAns)
            .HasForeignKey(d => d.LinhVucId)
            .OnDelete(DeleteBehavior.Restrict);

        // DeAn -> LoaiDeAn
        modelBuilder.Entity<DeAn>()
            .HasOne(d => d.LoaiDeAn)
            .WithMany(l => l.DeAns)
            .HasForeignKey(d => d.LoaiDeAnId)
            .OnDelete(DeleteBehavior.Restrict);

        // Các quan hệ 1-N khác (Cascade delete cho phép xóa các child logic)
        modelBuilder.Entity<GiaiNgan>()
            .HasOne(g => g.DeAn)
            .WithMany(d => d.GiaiNgans)
            .HasForeignKey(g => g.DeAnId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TienDoThucHien>()
            .HasOne(t => t.DeAn)
            .WithMany(d => d.TienDoThucHiens)
            .HasForeignKey(t => t.DeAnId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LichSuThaoTac>()
            .HasOne(l => l.DeAn)
            .WithMany(d => d.LichSuThaoTacs)
            .HasForeignKey(l => l.DeAnId)
            .OnDelete(DeleteBehavior.Cascade);

        // Quan hệ 1-1
        modelBuilder.Entity<DeAn>()
            .HasOne(d => d.ChiTieuKPI)
            .WithOne(c => c.DeAn)
            .HasForeignKey<ChiTieuKPI>(c => c.DeAnId)
            .OnDelete(DeleteBehavior.Cascade);

        // 2. CẤU HÌNH JSONB CHO POSTGRESQL TỐI ƯU
        
        modelBuilder.Entity<DeAn>()
            .Property(d => d.HoSoDinhKem)
            .HasColumnType("jsonb");

        modelBuilder.Entity<DeAn>()
            .Property(d => d.BienBanGiamSat)
            .HasColumnType("jsonb");

        modelBuilder.Entity<DeAn>()
            .Property(d => d.BienBanNghiemThu)
            .HasColumnType("jsonb");

        modelBuilder.Entity<GiaiNgan>()
            .Property(g => g.ChungTuDinhKem)
            .HasColumnType("jsonb");

        modelBuilder.Entity<TienDoThucHien>()
            .Property(t => t.FileBaoCao)
            .HasColumnType("jsonb");

        modelBuilder.Entity<ChiTieuKPI>()
            .Property(c => c.ThongKeHieuQua)
            .HasColumnType("jsonb");

        // Gọi Seed Data
        DbSeeder.SeedData(modelBuilder);
    }
}
