# =================================================================
# DOCKERFILE — FRONTEND REACTJS (Hệ thống Khuyến Công)
# Kỹ thuật: Multi-stage Build (Node.js build → Nginx phục vụ)
# =================================================================

# ---------------------------------------------------------------
# GIAI ĐOẠN 1: BUILD
# Dùng Node.js để cài thư viện và biên dịch React thành file tĩnh
# ---------------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

# Copy file định nghĩa thư viện trước để tận dụng Docker cache
COPY package.json package-lock.json ./

# Cài đặt toàn bộ thư viện npm (axios, react-router-dom...)
RUN npm install

# Copy toàn bộ mã nguồn ReactJS vào container
COPY . .

# Build ứng dụng React thành các file HTML/CSS/JS tĩnh
# Kết quả được lưu vào thư mục /app/dist
RUN npm run build

# ---------------------------------------------------------------
# GIAI ĐOẠN 2: SERVE
# Dùng Nginx cực nhẹ để phục vụ các file tĩnh cho trình duyệt
# ---------------------------------------------------------------
FROM nginx:alpine AS runtime

# Xóa cấu hình Nginx mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy cấu hình Nginx tùy chỉnh (Hỗ trợ React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy kết quả build từ giai đoạn 1 vào thư mục Nginx phục vụ
COPY --from=build /app/dist /usr/share/nginx/html

# Mở cổng 80 để trình duyệt truy cập
EXPOSE 80

# Nginx tự động chạy khi container khởi động
CMD ["nginx", "-g", "daemon off;"]
