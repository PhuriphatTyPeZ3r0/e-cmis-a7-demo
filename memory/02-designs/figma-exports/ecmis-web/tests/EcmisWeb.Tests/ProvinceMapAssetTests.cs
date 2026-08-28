using System.Text.Json;
using Xunit;
using EcmisWeb.Models;

namespace EcmisWeb.Tests;

/// <summary>ยืนยันว่า thai-provinces.json deserialize เป็น ProvinceMapData ได้จริง
/// ด้วย options แบบเดียวกับ HttpClient.GetFromJsonAsync (JsonSerializerDefaults.Web)</summary>
public class ProvinceMapAssetTests
{
    private static string AssetPath => Path.Combine(
        AppContext.BaseDirectory, "..", "..", "..", "..", "..",
        "src", "wwwroot", "data", "thai-provinces.json");

    [Fact]
    public void Asset_deserializes_with_web_defaults_like_GetFromJsonAsync()
    {
        var json = File.ReadAllText(AssetPath);
        var opts = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        var map = JsonSerializer.Deserialize<ProvinceMapData>(json, opts);

        Assert.NotNull(map);
        Assert.Equal("0 0 560 1025", map!.ViewBox);
        Assert.Equal(78, map.Locations.Count);
        Assert.Contains(map.Locations, l => l.Id == "bkk" && l.Name == "Bangkok");
        Assert.All(map.Locations, l => Assert.False(string.IsNullOrEmpty(l.Path)));
    }

    [Fact]
    public void ComputeCentroids_works_on_real_asset_all_9_zones()
    {
        var json = File.ReadAllText(AssetPath);
        var opts = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        var map = JsonSerializer.Deserialize<ProvinceMapData>(json, opts)!;

        var centroids = Pages.Analytics.Components.HeatmapLogic.ComputeCentroids(map.Locations);

        Assert.Equal(9, centroids.Count);
        // ทุก centroid ต้องอยู่ใน viewBox 560×1025
        Assert.All(centroids.Values, c =>
        {
            Assert.InRange(c.X, 0, 560);
            Assert.InRange(c.Y, 0, 1025);
        });

        // ความถูกต้องเชิงภูมิศาสตร์ (กันบั๊ก label กองรวมกัน):
        // เหนือบน(5) อยู่เหนือ กลาง(1), กลาง(1) อยู่เหนือ ใต้ล่าง(9)
        Assert.True(centroids[5].Y < centroids[1].Y, $"เขต 5 (Y={centroids[5].Y:0}) ต้องอยู่เหนือเขต 1 (Y={centroids[1].Y:0})");
        Assert.True(centroids[1].Y < centroids[9].Y, $"เขต 1 (Y={centroids[1].Y:0}) ต้องอยู่เหนือเขต 9 (Y={centroids[9].Y:0})");
        // ตะวันออก(2) อยู่ขวากว่า ตะวันตก(7)
        Assert.True(centroids[2].X > centroids[7].X, $"เขต 2 (X={centroids[2].X:0}) ต้องอยู่ขวากว่าเขต 7 (X={centroids[7].X:0})");
        // เขตต้องไม่กองรวมกัน: คู่ใดๆ ห่างกันอย่างน้อย 30 หน่วย
        var all = centroids.ToList();
        for (var i = 0; i < all.Count; i++)
            for (var j = i + 1; j < all.Count; j++)
            {
                var dx = all[i].Value.X - all[j].Value.X;
                var dy = all[i].Value.Y - all[j].Value.Y;
                Assert.True(Math.Sqrt(dx * dx + dy * dy) > 30,
                    $"เขต {all[i].Key} กับเขต {all[j].Key} ใกล้กันเกินไป");
            }
    }
}
