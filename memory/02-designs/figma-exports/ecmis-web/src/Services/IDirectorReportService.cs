using EcmisWeb.Models;

namespace EcmisWeb.Services;

public interface IDirectorReportService
{
    Task<DirectorReportSnapshot> GetSnapshotAsync(CancellationToken ct = default);
}
