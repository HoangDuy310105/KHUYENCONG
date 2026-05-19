using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DonVis",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MaSoThue = table.Column<string>(type: "text", nullable: false),
                    TenDonVi = table.Column<string>(type: "text", nullable: false),
                    LoaiDonVi = table.Column<int>(type: "integer", nullable: false),
                    QuyMo = table.Column<string>(type: "text", nullable: true),
                    DiaChi = table.Column<string>(type: "text", nullable: true),
                    SoDienThoai = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonVis", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LinhVucs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MaLinhVuc = table.Column<string>(type: "text", nullable: false),
                    TenLinhVuc = table.Column<string>(type: "text", nullable: false),
                    MoTa = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinhVucs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VanBanPhapLuats",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SoKyHieu = table.Column<string>(type: "text", nullable: false),
                    TrichYeu = table.Column<string>(type: "text", nullable: false),
                    NgayHieuLuc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TrangThai = table.Column<int>(type: "integer", nullable: false),
                    FileDinhKem = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VanBanPhapLuats", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NguoiDungs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    DonViId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NguoiDungs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NguoiDungs_DonVis_DonViId",
                        column: x => x.DonViId,
                        principalTable: "DonVis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SanPhamOcops",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DonViId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenSanPham = table.Column<string>(type: "text", nullable: false),
                    PhanHangSao = table.Column<int>(type: "integer", nullable: false),
                    NgayCongNhan = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SanPhamOcops", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SanPhamOcops_DonVis_DonViId",
                        column: x => x.DonViId,
                        principalTable: "DonVis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DeAns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MaDeAn = table.Column<string>(type: "text", nullable: false),
                    TenDeAn = table.Column<string>(type: "text", nullable: false),
                    LinhVucId = table.Column<Guid>(type: "uuid", nullable: false),
                    DonViThuHuongId = table.Column<Guid>(type: "uuid", nullable: false),
                    DonViThiCongId = table.Column<Guid>(type: "uuid", nullable: true),
                    KinhPhiDuKien = table.Column<decimal>(type: "numeric", nullable: false),
                    ThoiGianBatDau = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ThoiGianKetThuc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TrangThai = table.Column<int>(type: "integer", nullable: false),
                    HoSoDinhKem = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeAns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeAns_DonVis_DonViThiCongId",
                        column: x => x.DonViThiCongId,
                        principalTable: "DonVis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DeAns_DonVis_DonViThuHuongId",
                        column: x => x.DonViThuHuongId,
                        principalTable: "DonVis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DeAns_LinhVucs_LinhVucId",
                        column: x => x.LinhVucId,
                        principalTable: "LinhVucs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ChiTieuKPIs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeAnId = table.Column<Guid>(type: "uuid", nullable: false),
                    ThongKeHieuQua = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiTieuKPIs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChiTieuKPIs_DeAns_DeAnId",
                        column: x => x.DeAnId,
                        principalTable: "DeAns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GiaiNgans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeAnId = table.Column<Guid>(type: "uuid", nullable: false),
                    LoaiGiaiNgan = table.Column<int>(type: "integer", nullable: false),
                    SoTien = table.Column<decimal>(type: "numeric", nullable: false),
                    NgayGiaiNgan = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ChungTuDinhKem = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GiaiNgans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GiaiNgans_DeAns_DeAnId",
                        column: x => x.DeAnId,
                        principalTable: "DeAns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LichSuThaoTacs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeAnId = table.Column<Guid>(type: "uuid", nullable: true),
                    NguoiDungId = table.Column<Guid>(type: "uuid", nullable: false),
                    HanhDong = table.Column<string>(type: "text", nullable: false),
                    TrangThaiCu = table.Column<int>(type: "integer", nullable: true),
                    TrangThaiMoi = table.Column<int>(type: "integer", nullable: true),
                    LyDo = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichSuThaoTacs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LichSuThaoTacs_DeAns_DeAnId",
                        column: x => x.DeAnId,
                        principalTable: "DeAns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LichSuThaoTacs_NguoiDungs_NguoiDungId",
                        column: x => x.NguoiDungId,
                        principalTable: "NguoiDungs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TienDoThucHiens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DeAnId = table.Column<Guid>(type: "uuid", nullable: false),
                    ThangBaoCao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PhanTramHoanThanh = table.Column<int>(type: "integer", nullable: false),
                    GhiChuThucTe = table.Column<string>(type: "text", nullable: true),
                    FileBaoCao = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TienDoThucHiens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TienDoThucHiens_DeAns_DeAnId",
                        column: x => x.DeAnId,
                        principalTable: "DeAns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChiTieuKPIs_DeAnId",
                table: "ChiTieuKPIs",
                column: "DeAnId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DeAns_DonViThiCongId",
                table: "DeAns",
                column: "DonViThiCongId");

            migrationBuilder.CreateIndex(
                name: "IX_DeAns_DonViThuHuongId",
                table: "DeAns",
                column: "DonViThuHuongId");

            migrationBuilder.CreateIndex(
                name: "IX_DeAns_LinhVucId",
                table: "DeAns",
                column: "LinhVucId");

            migrationBuilder.CreateIndex(
                name: "IX_GiaiNgans_DeAnId",
                table: "GiaiNgans",
                column: "DeAnId");

            migrationBuilder.CreateIndex(
                name: "IX_LichSuThaoTacs_DeAnId",
                table: "LichSuThaoTacs",
                column: "DeAnId");

            migrationBuilder.CreateIndex(
                name: "IX_LichSuThaoTacs_NguoiDungId",
                table: "LichSuThaoTacs",
                column: "NguoiDungId");

            migrationBuilder.CreateIndex(
                name: "IX_NguoiDungs_DonViId",
                table: "NguoiDungs",
                column: "DonViId");

            migrationBuilder.CreateIndex(
                name: "IX_SanPhamOcops_DonViId",
                table: "SanPhamOcops",
                column: "DonViId");

            migrationBuilder.CreateIndex(
                name: "IX_TienDoThucHiens_DeAnId",
                table: "TienDoThucHiens",
                column: "DeAnId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChiTieuKPIs");

            migrationBuilder.DropTable(
                name: "GiaiNgans");

            migrationBuilder.DropTable(
                name: "LichSuThaoTacs");

            migrationBuilder.DropTable(
                name: "SanPhamOcops");

            migrationBuilder.DropTable(
                name: "TienDoThucHiens");

            migrationBuilder.DropTable(
                name: "VanBanPhapLuats");

            migrationBuilder.DropTable(
                name: "NguoiDungs");

            migrationBuilder.DropTable(
                name: "DeAns");

            migrationBuilder.DropTable(
                name: "DonVis");

            migrationBuilder.DropTable(
                name: "LinhVucs");
        }
    }
}
