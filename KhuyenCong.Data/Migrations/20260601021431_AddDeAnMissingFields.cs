using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDeAnMissingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "KinhDo",
                table: "DonVis",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "ViDo",
                table: "DonVis",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<JsonDocument>(
                name: "BienBanGiamSat",
                table: "DeAns",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<JsonDocument>(
                name: "BienBanNghiemThu",
                table: "DeAns",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DiaDiem",
                table: "DeAns",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DonViGiamSatId",
                table: "DeAns",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayNghiemThu",
                table: "DeAns",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ThoiGianGiamSat",
                table: "DeAns",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "DonVis",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "KinhDo", "ViDo" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "DonVis",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"),
                columns: new[] { "KinhDo", "ViDo" },
                values: new object[] { null, null });

            migrationBuilder.CreateIndex(
                name: "IX_DeAns_DonViGiamSatId",
                table: "DeAns",
                column: "DonViGiamSatId");

            migrationBuilder.AddForeignKey(
                name: "FK_DeAns_DonVis_DonViGiamSatId",
                table: "DeAns",
                column: "DonViGiamSatId",
                principalTable: "DonVis",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DeAns_DonVis_DonViGiamSatId",
                table: "DeAns");

            migrationBuilder.DropIndex(
                name: "IX_DeAns_DonViGiamSatId",
                table: "DeAns");

            migrationBuilder.DropColumn(
                name: "KinhDo",
                table: "DonVis");

            migrationBuilder.DropColumn(
                name: "ViDo",
                table: "DonVis");

            migrationBuilder.DropColumn(
                name: "BienBanGiamSat",
                table: "DeAns");

            migrationBuilder.DropColumn(
                name: "BienBanNghiemThu",
                table: "DeAns");

            migrationBuilder.DropColumn(
                name: "DiaDiem",
                table: "DeAns");

            migrationBuilder.DropColumn(
                name: "DonViGiamSatId",
                table: "DeAns");

            migrationBuilder.DropColumn(
                name: "NgayNghiemThu",
                table: "DeAns");

            migrationBuilder.DropColumn(
                name: "ThoiGianGiamSat",
                table: "DeAns");
        }
    }
}
