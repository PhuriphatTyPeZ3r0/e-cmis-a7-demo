using EcmisWeb.Models;

namespace EcmisWeb.Services;

public interface IComplaintStatsService
{
    Task<StatsSnapshot> GetSnapshotAsync(StatsFilter filter, CancellationToken ct = default);
}
