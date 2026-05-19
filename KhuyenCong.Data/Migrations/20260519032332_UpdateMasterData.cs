using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KhuyenCong.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMasterData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DinhMucHoTroMax",
                table: "LinhVucs",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaHuyen",
                table: "DonVis",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaTinh",
                table: "DonVis",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaXa",
                table: "DonVis",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LoaiDeAn",
                table: "DeAns",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "DonVis",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                columns: new[] { "MaHuyen", "MaTinh", "MaXa" },
                values: new object[] { null, null, null });

            migrationBuilder.UpdateData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a1111111-1111-1111-1111-111111111111"),
                column: "DinhMucHoTroMax",
                value: null);

            migrationBuilder.UpdateData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a2222222-2222-2222-2222-222222222222"),
                column: "DinhMucHoTroMax",
                value: null);

            migrationBuilder.UpdateData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a3333333-3333-3333-3333-333333333333"),
                column: "DinhMucHoTroMax",
                value: null);

            migrationBuilder.UpdateData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a4444444-4444-4444-4444-444444444444"),
                column: "DinhMucHoTroMax",
                value: null);

            migrationBuilder.UpdateData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a5555555-5555-5555-5555-555555555555"),
                column: "DinhMucHoTroMax",
                value: null);

            migrationBuilder.UpdateData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a6666666-6666-6666-6666-666666666666"),
                column: "DinhMucHoTroMax",
                value: null);

            migrationBuilder.UpdateData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a7777777-7777-7777-7777-777777777777"),
                column: "DinhMucHoTroMax",
                value: null);

            migrationBuilder.UpdateData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a8888888-8888-8888-8888-888888888888"),
                column: "DinhMucHoTroMax",
                value: null);

            migrationBuilder.UpdateData(
                table: "LinhVucs",
                keyColumn: "Id",
                keyValue: new Guid("a9999999-9999-9999-9999-999999999999"),
                column: "DinhMucHoTroMax",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DinhMucHoTroMax",
                table: "LinhVucs");

            migrationBuilder.DropColumn(
                name: "MaHuyen",
                table: "DonVis");

            migrationBuilder.DropColumn(
                name: "MaTinh",
                table: "DonVis");

            migrationBuilder.DropColumn(
                name: "MaXa",
                table: "DonVis");

            migrationBuilder.DropColumn(
                name: "LoaiDeAn",
                table: "DeAns");
        }
    }
}
