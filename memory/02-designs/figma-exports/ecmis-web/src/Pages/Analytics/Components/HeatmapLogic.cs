using System.Globalization;
using System.Text.RegularExpressions;
using EcmisWeb.Models;

namespace EcmisWeb.Pages.Analytics.Components;

public static class HeatmapLogic
{
    /// <summary>รหัสจังหวัด (svg id) → เขต ปปท. 1–9; กทม./ทะเลสาบไม่อยู่ในตาราง (= ส่วนกลาง/ไม่มีเขต)
    /// ตารางยกมาจาก p-ecmis ThailandHeatmap.tsx ซึ่งยืนยันเขตอำนาจ ป.ป.ท. จริงแล้ว — แก้ที่นี่ที่เดียว</summary>
    public static readonly IReadOnlyDictionary<string, int> ProvinceZone = new Dictionary<string, int>
    {
        ["nbi"] = 1, ["pte"] = 1, ["aya"] = 1, ["sri"] = 1, ["lri"] = 1, ["sbr"] = 1, ["atg"] = 1, ["cnt"] = 1,
        ["cbi"] = 2, ["ryg"] = 2, ["cti"] = 2, ["trt"] = 2, ["cco"] = 2, ["pri"] = 2, ["skw"] = 2, ["nyk"] = 2, ["spk"] = 2,
        ["nma"] = 3, ["brm"] = 3, ["srn"] = 3, ["ssk"] = 3, ["ubn"] = 3, ["yst"] = 3, ["acr"] = 3, ["cpm"] = 3,
        ["kkn"] = 4, ["udn"] = 4, ["lei"] = 4, ["nki"] = 4, ["nbp"] = 4, ["bkn"] = 4, ["snk"] = 4, ["npm"] = 4,
        ["mdh"] = 4, ["mkm"] = 4, ["ret"] = 4, ["ksn"] = 4,
        ["cmi"] = 5, ["lpn"] = 5, ["lpg"] = 5, ["utd"] = 5, ["pre"] = 5, ["nan"] = 5, ["pyo"] = 5, ["cri"] = 5, ["msn"] = 5,
        ["nsn"] = 6, ["uti"] = 6, ["kpt"] = 6, ["tak"] = 6, ["sti"] = 6, ["plk"] = 6, ["pct"] = 6, ["pnb"] = 6,
        ["rbr"] = 7, ["kri"] = 7, ["spb"] = 7, ["npt"] = 7, ["skn"] = 7, ["skm"] = 7, ["pbi"] = 7, ["pkn"] = 7,
        ["nrt"] = 8, ["kbi"] = 8, ["pna"] = 8, ["pkt"] = 8, ["sni"] = 8, ["rng"] = 8, ["cpn"] = 8,
        ["ska"] = 9, ["stn"] = 9, ["trg"] = 9, ["plg"] = 9, ["ptn"] = 9, ["yla"] = 9, ["nwt"] = 9,
    };

    public static string ZoneName(int zone) => zone switch
    {
        1 => "เขต 1 (ภาคกลาง)", 2 => "เขต 2 (ภาคตะวันออก)", 3 => "เขต 3 (อีสานใต้)",
        4 => "เขต 4 (อีสานบน)", 5 => "เขต 5 (เหนือบน)", 6 => "เขต 6 (เหนือล่าง)",
        7 => "เขต 7 (ตะวันตก)", 8 => "เขต 8 (ใต้บน)", 9 => "เขต 9 (ใต้ล่าง)",
        _ => $"เขต {zone}",
    };

    /// <summary>0 = เขียว (น้อย) → 1 = แดง (มาก) — สูตรเดียวกับ p-ecmis</summary>
    public static string ColorForT(double t)
    {
        var c = Math.Clamp(t, 0, 1);
        var hue = (140 * (1 - c)).ToString("0.##", CultureInfo.InvariantCulture);
        return $"hsl({hue}, 75%, 45%)";
    }

    public static double TFor(int value, int maxValue)
        => maxValue <= 0 ? 0 : Math.Clamp((double)value / maxValue, 0, 1);

    /// <summary>"ปปท.4" → 4, "ส่วนกลาง"/อื่นๆ → null (ใช้ map ZoneVm.ByRegion → เลขเขต)</summary>
    public static int? ZoneFromRegionLabel(string label)
        => label.StartsWith("ปปท.") && int.TryParse(label[4..], out var n) && n is >= 1 and <= 9 ? n : null;

    /// <summary>จุดกึ่งกลางเขต = เฉลี่ยพิกัดสัมบูรณ์ของจังหวัดในเขต
    /// (ต้องเดินตาม path จริง เพราะข้อมูลเป็น relative moveto/lineto — เฉลี่ยตัวเลขดิบจะกองที่มุมซ้ายบน)</summary>
    public static Dictionary<int, (double X, double Y)> ComputeCentroids(IEnumerable<ProvinceLocation> locations)
    {
        var acc = new Dictionary<int, (double X, double Y, int N)>();
        foreach (var loc in locations)
        {
            if (!ProvinceZone.TryGetValue(loc.Id, out var zone)) continue;
            var pts = WalkPath(loc.Path);
            if (pts.Count == 0) continue;
            var cx = pts.Average(p => p.X);
            var cy = pts.Average(p => p.Y);
            var a = acc.TryGetValue(zone, out var v) ? v : (0, 0, 0);
            acc[zone] = (a.Item1 + cx, a.Item2 + cy, a.Item3 + 1);
        }
        return acc.ToDictionary(kv => kv.Key, kv => (kv.Value.X / kv.Value.N, kv.Value.Y / kv.Value.N));
    }

    /// <summary>เดิน path คืนพิกัดสัมบูรณ์ทุกจุด — รองรับ m/M (moveto + implicit lineto) และ z/Z
    /// (ชุดข้อมูล @svg-maps/thailand ใช้แค่ m กับ z; จุดแรกของ path เป็นพิกัดสัมบูรณ์เสมอตามสเปก SVG)</summary>
    private static List<(double X, double Y)> WalkPath(string path)
    {
        var pts = new List<(double X, double Y)>();
        var tokens = Regex.Matches(path, @"[a-zA-Z]|-?\d+(?:\.\d+)?(?:e-?\d+)?");
        double cx = 0, cy = 0, subX = 0, subY = 0;
        var first = true;
        var pendingMove = false;
        var cmd = 'm';
        for (var i = 0; i < tokens.Count; i++)
        {
            var t = tokens[i].Value;
            if (t.Length == 1 && char.IsLetter(t[0]))
            {
                cmd = t[0];
                if (cmd is 'z' or 'Z') { cx = subX; cy = subY; }   // close → กลับจุดเริ่ม subpath
                else if (cmd is 'm' or 'M') pendingMove = true;
                continue;
            }
            var x = double.Parse(t, CultureInfo.InvariantCulture);
            if (++i >= tokens.Count) break;
            var y = double.Parse(tokens[i].Value, CultureInfo.InvariantCulture);
            if (char.IsUpper(cmd) || first) { cx = x; cy = y; }
            else { cx += x; cy += y; }
            if (pendingMove) { subX = cx; subY = cy; pendingMove = false; }
            first = false;
            pts.Add((cx, cy));
        }
        return pts;
    }
}
