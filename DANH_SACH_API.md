# DANH SÁCH API BACKEND — HỆ THỐNG QUẢN LÝ KHUYẾN CÔNG

**Base URL:** `http://localhost:5005/api`  
**Xác thực:** `Authorization: Bearer {token}` (Trừ API Đăng nhập)

---

## BẢNG PHÂN QUYỀN (ROLES)

| Mã | Role | Phạm vi trách nhiệm |
|:---:|:---|:---|
| 1 | Role_CoSo | Doanh nghiệp, HTX (Chủ đầu tư đề án) |
| 2 | Role_So | Sở Công Thương / Trung tâm KC (Quản lý cấp Tỉnh) |
| 3 | Role_Bo | Cục Công Thương địa phương (Quản lý cấp Trung ương) |
| 4 | Role_Admin | Quản trị hệ thống (Kỹ thuật) |

---

## NHÓM 1 — XÁC THỰC & TÀI KHOẢN

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---|
| 01 | POST | /auth/login | Đăng nhập lấy Token JWT | Public |
| 02 | POST | /auth/doi-mat-khau | Đổi mật khẩu cá nhân | Tất cả |
| 03 | GET | /auth/me | Lấy thông tin profile đang đăng nhập | Tất cả |

---

## NHÓM 2 — DANH MỤC LĨNH VỰC

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---|
| 04 | GET | /linhvuc | Danh sách 9 nhóm lĩnh vực (NĐ 45) | Public |
| 05 | GET | /linhvuc/{id} | Chi tiết 1 lĩnh vực | Role_So, Admin |
| 06 | POST | /linhvuc | Thêm lĩnh vực mới | Admin |
| 07 | PUT | /linhvuc/{id} | Cập nhật lĩnh vực | Admin |

---

## NHÓM 3 — QUẢN LÝ ĐƠN VỊ / DOANH NGHIỆP

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---|
| 08 | GET | /donvi | Danh sách đơn vị (Phân trang, lọc địa bàn) | Role_So, Role_Bo, Admin |
| 09 | GET | /donvi/{id} | Chi tiết thông tin đơn vị | Role_So, Role_Bo, Admin |
| 10 | POST | /donvi | Thêm đơn vị/doanh nghiệp mới | Role_So, Admin |
| 11 | PUT | /donvi/{id} | Cập nhật thông tin đơn vị | Role_So, Admin |
| 12 | DELETE | /donvi/{id} | Vô hiệu hóa đơn vị (Khóa) | Admin |
| 13 | POST | /donvi/import-excel | Nhập danh sách đơn vị hàng loạt | **Role_So, Admin** |
| 14 | GET | /donvi/export-excel | Xuất danh sách đơn vị ra Excel | Role_So, Admin |

---

## NHÓM 4 — QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---|
| 15 | GET | /nguoidung | Danh sách tài khoản cán bộ/doanh nghiệp | Admin |
| 16 | GET | /nguoidung/{id} | Chi tiết tài khoản | Admin |
| 17 | POST | /nguoidung | Tạo tài khoản mới (Hệ thống băm mật khẩu) | Admin |
| 18 | PUT | /nguoidung/{id} | Thay đổi quyền hoặc Trạng thái khóa | Admin |
| 19 | DELETE | /nguoidung/{id} | Khóa tài khoản vĩnh viễn | Admin |

---

## NHÓM 5 — QUẢN LÝ ĐỀ ÁN (QUY TRÌNH 10 BƯỚC)

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---|
| 20 | GET | /dean | Danh sách đề án (Tự động lọc theo Role) | Tất cả |
| 21 | GET | /dean/{id} | Chi tiết đề án & Hồ sơ đính kèm (JSONB) | Tất cả |
| 22 | POST | /dean | Khởi tạo đề án mới (Lưu bản nháp) | Role_CoSo |
| 23 | PUT | /dean/{id} | Sửa đề án (Chỉ khi chưa gửi duyệt) | Role_CoSo |
| 24 | DELETE | /dean/{id} | Hủy/Thu hồi đề án | Role_CoSo, Role_So, Admin |
| 25 | POST | /dean/{id}/nop | **Nộp hồ sơ:** Gửi từ Cơ sở lên Sở CT | Role_CoSo |
| 26 | POST | /dean/{id}/duyet | **Phê duyệt:** Chuyển sang bước tiếp theo | **Role_So (bước 2,3,4,8), Role_Bo (bước 5,9,10)** |
| 27 | POST | /dean/{id}/tra-ve | **Trả hồ sơ:** Yêu cầu sửa đổi hoặc Từ chối | **Role_So, Role_Bo** |

---

## NHÓM 6 — KINH PHÍ & GIẢI NGÂN (THEO TT 28)

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---|
| 28 | GET | /giaingan/{deanId} | Lịch sử các đợt giải ngân | Role_So, Role_Bo |
| 29 | POST | /giaingan | Lập hồ sơ đề nghị (Tạm ứng/Quyết toán) | Role_CoSo |
| 30 | PUT | /giaingan/{id}/duyet | Phê duyệt giải ngân tiền mặt/chuyển khoản | Role_So (Kế toán) |
| 31 | PUT | /giaingan/{id}/tu-choi | Từ chối hồ sơ giải ngân (Thiếu chứng từ) | Role_So (Kế toán) |
| 32 | GET | /giaingan/{deanId}/export-excel | Xuất bảng kê thanh toán Excel | Role_So |

---

## NHÓM 7 — TIẾN ĐỘ & CHỈ TIÊU KPI (5 CHỈ SỐ)

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---|
| 33 | GET | /tiendo/{deanId} | Lịch sử báo cáo tiến độ hàng tháng | Tất cả |
| 34 | POST | /tiendo | Gửi báo cáo tiến độ & Hình ảnh hiện trường | Role_CoSo, Role_So |
| 35 | GET | /kpi/{deanId} | Xem kết quả 5 chỉ số KPI (GTSX, Việc làm...) | Tất cả |
| 36 | PUT | /kpi/{deanId} | Chốt số liệu KPI sau nghiệm thu | Role_So |

---

## NHÓM 8 — DASHBOARD & BÁO CÁO (THÔNG TƯ 34)

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---|
| 37 | GET | /dashboard/thong-ke | Tổng hợp số liệu (Biểu đồ Radar/Pipeline) | Role_So, Role_Bo, Admin |
| 38 | GET | /dashboard/bieu-do-linh-vuc | Thống kê cơ cấu đề án theo 9 lĩnh vực | Role_So, Role_Bo |
| 39 | GET | /dashboard/bieu-do-tinh | Bản đồ số phân bổ đề án toàn quốc | Role_Bo, Admin |
| 40 | GET | /baocao/tt34/{nam} | Tổng hợp số liệu theo mẫu Thông tư 34 | Role_So, Role_Bo |
| 41 | GET | /baocao/tt34/{nam}/export-pdf | Xuất báo cáo TT 34 ra file PDF có màu | Role_So, Role_Bo |

---

## NHÓM 9 — AUDIT LOG (LƯU VẾT)

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---|
| 42 | GET | /lichsu/{deanId} | Xem ai đã duyệt/sửa đề án vào lúc nào | Tất cả |
| 43 | GET | /lichsu/nguoidung/{userId} | Tra cứu hành vi của một tài khoản | Admin |

---

## NHÓM 10 — SẢN PHẨM OCOP (XÚC TIẾN)

| STT | Method | Endpoint | Mô tả | Quyền |
|:---:|:---:|:---|:---|:---|
| 44 | GET | /ocop | Danh sách sản phẩm địa phương | Tất cả |
| 45 | POST | /ocop | Đăng ký sản phẩm mới | Role_CoSo, Role_So |
| 46 | PUT | /ocop/{id} | Duyệt/Sửa thông tin sản phẩm | Role_So, Admin |
| 47 | POST | /ocop/import-excel | Nhập danh sách sản phẩm hàng loạt | Role_So, Admin |

---

## TÌNH TRẠNG TRIỂN KHAI (Dự kiến)

*   **Đã hoàn thành:** Nhóm 1, 2, 3, 4 (Phần lõi).
*   **Sắp tới (Tuần 4):** Nhóm 5, 6, 7 (Nghiệp vụ đề án).
*   **Sau cùng (Tuần 5):** Nhóm 8, 9, 10 (Báo cáo & Mở rộng).
