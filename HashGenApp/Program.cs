using KhuyenCong.Data.Context;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System;

class Program
{
    static void Main()
    {
        var optionsBuilder = new DbContextOptionsBuilder<KhuyenCongDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=KhuyenCongDB;Username=postgres;Password=123456;");
        
        using var context = new KhuyenCongDbContext(optionsBuilder.Options);
        var donvis = context.DonVis.ToList();
        var rand = new Random();
        foreach(var d in donvis) {
            if (d.ViDo == null || d.ViDo == 0) {
                d.ViDo = 10.1 + (rand.NextDouble() * 0.3);
                d.KinhDo = 106.2 + (rand.NextDouble() * 0.4);
            }
        }
        context.SaveChanges();
        Console.WriteLine("Updated coords for " + donvis.Count + " DonVis.");
    }
}
