using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OddsScanner.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMatchStatsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AvgCorners",
                table: "Matches",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AvgGoals",
                table: "Matches",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "MatchAwayForm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Result = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                    Opponent = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MatchId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchAwayForm", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchAwayForm_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MatchHeadToHead",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    HomeScore = table.Column<int>(type: "integer", nullable: false),
                    AwayScore = table.Column<int>(type: "integer", nullable: false),
                    Winner = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MatchId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchHeadToHead", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchHeadToHead_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MatchHomeForm",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Result = table.Column<string>(type: "character varying(1)", maxLength: 1, nullable: false),
                    Opponent = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MatchId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchHomeForm", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchHomeForm_Matches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "Matches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MatchAwayForm_MatchId",
                table: "MatchAwayForm",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchHeadToHead_MatchId",
                table: "MatchHeadToHead",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchHomeForm_MatchId",
                table: "MatchHomeForm",
                column: "MatchId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MatchAwayForm");

            migrationBuilder.DropTable(
                name: "MatchHeadToHead");

            migrationBuilder.DropTable(
                name: "MatchHomeForm");

            migrationBuilder.DropColumn(
                name: "AvgCorners",
                table: "Matches");

            migrationBuilder.DropColumn(
                name: "AvgGoals",
                table: "Matches");
        }
    }
}
