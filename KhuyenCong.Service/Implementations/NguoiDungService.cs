using AutoMapper;
using KhuyenCong.Core.Entities;
using KhuyenCong.Core.Interfaces;
using KhuyenCong.Service.DTOs;
using KhuyenCong.Service.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace KhuyenCong.Service.Implementations;

public class NguoiDungService : INguoiDungService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public NguoiDungService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<NguoiDungDto>> GetAllAsync()
    {
        var entities = await _unitOfWork.NguoiDungs.GetAllAsync();
        return _mapper.Map<IEnumerable<NguoiDungDto>>(entities);
    }

    public async Task<NguoiDungDto?> GetByIdAsync(Guid id)
    {
        var entity = await _unitOfWork.NguoiDungs.GetByIdAsync(id);
        return _mapper.Map<NguoiDungDto>(entity);
    }

    public async Task<NguoiDungDto> CreateAsync(NguoiDungDto dto)
    {
        var entity = _mapper.Map<NguoiDung>(dto);
        
        // Kiểm tra mật khẩu đầu vào
        if (string.IsNullOrEmpty(dto.Password))
        {
            throw new ArgumentException("Mật khẩu không được để trống khi tạo mới tài khoản.");
        }

        // Băm mật khẩu (Hash) sử dụng BCrypt để bảo mật trước khi lưu vào CSDL
        entity.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        
        // Mặc định tài khoản mới tạo sẽ được kích hoạt
        entity.IsActive = true;

        await _unitOfWork.NguoiDungs.AddAsync(entity);
        await _unitOfWork.CompleteAsync();
        
        return _mapper.Map<NguoiDungDto>(entity);
    }

    public async Task<bool> UpdateAsync(Guid id, NguoiDungDto dto)
    {
        var existing = await _unitOfWork.NguoiDungs.GetByIdAsync(id);
        if (existing == null) return false;

        // Chỉ cập nhật các thông tin cơ bản, KHÔNG cập nhật mật khẩu ở hàm này
        existing.Role = (KhuyenCong.Core.Enums.RoleType)dto.Role;
        existing.DonViId = dto.DonViId;
        existing.IsActive = dto.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.NguoiDungs.Update(existing);
        await _unitOfWork.CompleteAsync();
        
        return true;
    }

    public async Task<bool> ChangePasswordAsync(Guid id, string newPassword)
    {
        var existing = await _unitOfWork.NguoiDungs.GetByIdAsync(id);
        if (existing == null) return false;

        // Băm mật khẩu mới
        existing.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        existing.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.NguoiDungs.Update(existing);
        await _unitOfWork.CompleteAsync();
        
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var existing = await _unitOfWork.NguoiDungs.GetByIdAsync(id);
        if (existing == null) return false;

        // Ở đây chúng ta có thể thực hiện xóa cứng (Remove) hoặc xóa mềm (Vô hiệu hóa)
        // Thông thường tài khoản nên xóa mềm để giữ lại lịch sử các đề án họ đã tạo
        existing.IsActive = false;
        existing.UpdatedAt = DateTime.UtcNow;
        
        _unitOfWork.NguoiDungs.Update(existing);
        await _unitOfWork.CompleteAsync();
        
        return true;
    }
}
