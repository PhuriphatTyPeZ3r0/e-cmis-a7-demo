namespace EcmisWeb.Pages.Analytics;

public sealed record WarRoomRiskRow(int Rank, string Title, string Owner, string Budget, int Score, string Category);

public sealed record WarRoomRegionScore(string Name, int Score);

public sealed record WarRoomProvinceScore(int Index, string Name, int Score);

public sealed record WarRoomAlertRow(string Time, string Level, string Type, string Title, string Detail, int Score);

public sealed record WarRoomActionRow(int Rank, string Title, string Owner, string Status, string Level, string Due, string Deadline, string Category);

public sealed record WarRoomAnomalyRow(int Rank, string Title, string Province, int Score, string Level, string DetectedAt);

public enum WarRoomChartLayout
{
    TripleEqual,
    StackedLeft
}

public sealed record WarRoomChartSlot(string Title, string CanvasId);
