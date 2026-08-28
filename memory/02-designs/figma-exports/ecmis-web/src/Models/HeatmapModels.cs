namespace EcmisWeb.Models;

/// <summary>ค่าหนึ่งเขตบนฮีทแมพ: Value = ค่าเมตริกที่เลือก, Total = ทั้งหมดในเขต</summary>
public record ZoneHeatValue(int Value, int Total);

/// <summary>DTO ของ wwwroot/data/thai-provinces.json (จาก @svg-maps/thailand, MIT)</summary>
public class ProvinceMapData
{
    public string ViewBox { get; set; } = "";
    public List<ProvinceLocation> Locations { get; set; } = new();
}

public class ProvinceLocation
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Path { get; set; } = "";
}
