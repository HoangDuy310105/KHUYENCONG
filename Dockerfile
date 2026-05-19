# =================================================================
# DOCKERFILE — BACKEND .NET 10 (Hệ thống Khuyến Công)
# Kỹ thuật: Multi-stage Build (Giảm kích thước image cuối cùng)
# =================================================================

# ---------------------------------------------------------------
# GIAI ĐOẠN 1: BUILD
# Dùng image SDK đầy đủ để biên dịch mã nguồn C# thành file .dll
# ---------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy NuGet.Config trước để ghi đè cấu hình fallback folder của Windows
# (Quan trọng: Docker chạy Linux, không có thư mục Visual Studio)
COPY NuGet.Config .

# Copy file định nghĩa thư viện của từng tầng trước
# (Tách riêng để Docker cache layer này — Không cần restore lại nếu code chưa đổi)
COPY KhuyenCong.Core/KhuyenCong.Core.csproj       KhuyenCong.Core/
COPY KhuyenCong.Data/KhuyenCong.Data.csproj       KhuyenCong.Data/
COPY KhuyenCong.Service/KhuyenCong.Service.csproj KhuyenCong.Service/
COPY KhuyenCong.API/KhuyenCong.API.csproj         KhuyenCong.API/

# Tải về toàn bộ thư viện NuGet cần thiết
RUN dotnet restore KhuyenCong.API/KhuyenCong.API.csproj

# Copy toàn bộ mã nguồn còn lại vào container
COPY KhuyenCong.Core/    KhuyenCong.Core/
COPY KhuyenCong.Data/    KhuyenCong.Data/
COPY KhuyenCong.Service/ KhuyenCong.Service/
COPY KhuyenCong.API/     KhuyenCong.API/

# Biên dịch và xuất bản ứng dụng (Bỏ --no-restore để tránh lỗi fallback folder)
RUN dotnet publish KhuyenCong.API/KhuyenCong.API.csproj \
    -c Release \
    -o /app/publish

# ---------------------------------------------------------------
# GIAI ĐOẠN 2: RUNTIME
# Chỉ dùng image Runtime nhỏ gọn (Không có SDK — Giảm ~300MB)
# ---------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Mở cổng 5005 để Docker Compose và máy chủ bên ngoài kết nối
EXPOSE 5005

# Đặt môi trường chạy là Production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5005

# Copy kết quả đã biên dịch từ giai đoạn 1 sang
COPY --from=build /app/publish .

# Lệnh chạy khi container khởi động
ENTRYPOINT ["dotnet", "KhuyenCong.API.dll"]
