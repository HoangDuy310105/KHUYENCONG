using AutoMapper;
using KhuyenCong.Core.Entities;
using KhuyenCong.Service.DTOs;

namespace KhuyenCong.Service.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Entity to DTO
        CreateMap<DonVi, DonViDto>();
        CreateMap<LinhVuc, LinhVucDto>();
        CreateMap<DeAn, DeAnDto>()
            .ForMember(dest => dest.TenLoaiDeAn, opt => opt.MapFrom(src => src.LoaiDeAn != null ? src.LoaiDeAn.TenLoai : null))
            .ForMember(dest => dest.TenLinhVuc, opt => opt.MapFrom(src => src.LinhVuc != null ? src.LinhVuc.TenLinhVuc : null))
            .ForMember(dest => dest.TenDonViThuHuong, opt => opt.MapFrom(src => src.DonViThuHuong != null ? src.DonViThuHuong.TenDonVi : null))
            .ForMember(dest => dest.DiaChi, opt => opt.MapFrom(src => src.DonViThuHuong != null ? src.DonViThuHuong.DiaChi : null))
            .ForMember(dest => dest.TenDonViThiCong, opt => opt.MapFrom(src => src.DonViThiCong != null ? src.DonViThiCong.TenDonVi : null))
            .ForMember(dest => dest.DonViGiamSat, opt => opt.MapFrom(src => src.DonViGiamSat != null ? src.DonViGiamSat.TenDonVi : null))
            .ForMember(dest => dest.KinhPhiTamUng, opt => opt.MapFrom(src => src.GiaiNgans != null ? src.GiaiNgans.Where(g => g.LoaiGiaiNgan == KhuyenCong.Core.Enums.LoaiGiaiNgan.TamUng).Sum(g => g.SoTien) : 0))
            .ForMember(dest => dest.KinhPhiQuyetToan, opt => opt.MapFrom(src => src.GiaiNgans != null ? src.GiaiNgans.Where(g => g.LoaiGiaiNgan == KhuyenCong.Core.Enums.LoaiGiaiNgan.QuyetToan).Sum(g => g.SoTien) : 0))
            .ForMember(dest => dest.ViDo, opt => opt.MapFrom(src => src.DonViThuHuong != null ? src.DonViThuHuong.ViDo : null))
            .ForMember(dest => dest.KinhDo, opt => opt.MapFrom(src => src.DonViThuHuong != null ? src.DonViThuHuong.KinhDo : null));

        // NguoiDung mapping
        CreateMap<NguoiDung, NguoiDungDto>()
            .ForMember(dest => dest.Password, opt => opt.Ignore())
            .ForMember(dest => dest.TenDonVi, opt => opt.MapFrom(src => src.DonVi != null ? src.DonVi.TenDonVi : null));
        CreateMap<NguoiDungDto, NguoiDung>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

        // DTO to Entity
        CreateMap<DonViDto, DonVi>();
        CreateMap<LinhVucDto, LinhVuc>();
        CreateMap<DeAnDto, DeAn>();
        CreateMap<LoaiDeAnDto, LoaiDeAn>();
        CreateMap<LoaiDeAn, LoaiDeAnDto>();
        
        CreateMap<VanBanPhapLuat, VanBanDto>()
            .ForMember(dest => dest.TrangThai, opt => opt.MapFrom(src => (int)src.TrangThai));
        CreateMap<VanBanDto, VanBanPhapLuat>()
            .ForMember(dest => dest.TrangThai, opt => opt.MapFrom(src => (KhuyenCong.Core.Enums.TrangThaiVanBan)src.TrangThai));

        // TinTuc mapping
        CreateMap<TinTuc, TinTucDto>();
        CreateMap<CreateTinTucDto, TinTuc>();
        CreateMap<UpdateTinTucDto, TinTuc>();
    }
}
