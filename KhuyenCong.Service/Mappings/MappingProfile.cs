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
            .ForMember(dest => dest.TenLinhVuc, opt => opt.MapFrom(src => src.LinhVuc != null ? src.LinhVuc.TenLinhVuc : null))
            .ForMember(dest => dest.TenDonViThuHuong, opt => opt.MapFrom(src => src.DonViThuHuong != null ? src.DonViThuHuong.TenDonVi : null));

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
    }
}
