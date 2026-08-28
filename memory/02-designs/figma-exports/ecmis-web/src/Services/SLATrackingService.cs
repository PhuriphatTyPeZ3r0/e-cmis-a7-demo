using EcmisWeb.Data;

namespace EcmisWeb.Services;

/// <summary>
/// SLA Tracking Service
/// - SLA clock starts from FIRST RECEIVED DATE, not key-in date
/// - 15-day return-to-ombudsman deadline enforcement
/// - 6-month alert warning
/// </summary>
public class SLATrackingService
{
    private const int RETURN_TO_OMBUDSMAN_DAYS = 15;
    private const int ALERT_THRESHOLD_MONTHS = 6;

    private List<SLATracking> _slaTracking = new();
    private readonly ILogger<SLATrackingService> _logger;

    public SLATrackingService(ILogger<SLATrackingService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Create SLA tracking record (SLA starts from FirstReceivedDate)
    /// </summary>
    public SLATracking CreateSLATracker(string caseNo, DateTime firstReceivedDate)
    {
        try
        {
            // SLA deadline is typically 60 days (Thai government standard)
            // or as specified by business rules
            var deadline = firstReceivedDate.AddDays(60);
            var remainingDays = (int)(deadline - DateTime.Now).TotalDays;
            var isNearDeadline = remainingDays < (ALERT_THRESHOLD_MONTHS * 30);

            var tracker = new SLATracking
            {
                Id = _slaTracking.Count + 1,
                CaseNo = caseNo,
                FirstReceivedDate = firstReceivedDate,
                Deadline = deadline,
                RemainingDays = Math.Max(0, remainingDays),
                IsNearDeadline = isNearDeadline,
                Status = remainingDays <= 0 ? "overdue" : "in-progress"
            };

            _slaTracking.Add(tracker);
            _logger.LogInformation($"SLA tracking created for {caseNo}: Deadline {deadline:yyyy-MM-dd}");

            return tracker;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating SLA tracker: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Get SLA tracking by case
    /// </summary>
    public SLATracking? GetSLATracking(string caseNo)
    {
        return _slaTracking.FirstOrDefault(s => s.CaseNo == caseNo);
    }

    /// <summary>
    /// Get all cases near deadline (< 6 months remaining)
    /// </summary>
    public List<SLATracking> GetAlertCases()
    {
        return _slaTracking
            .Where(s => s.IsNearDeadline && s.Status == "in-progress")
            .OrderBy(s => s.RemainingDays)
            .ToList();
    }

    /// <summary>
    /// Check if case should be returned to ombudsman (must be within 15 days)
    /// </summary>
    public (bool CanReturn, string Reason) CanReturnToOmbudsman(string caseNo)
    {
        try
        {
            var tracking = GetSLATracking(caseNo);
            if (tracking == null)
                return (false, "SLA tracking not found");

            var daysSinceReceived = (int)(DateTime.Now - tracking.FirstReceivedDate).TotalDays;

            if (daysSinceReceived <= RETURN_TO_OMBUDSMAN_DAYS)
                return (true, $"Can return (Day {daysSinceReceived}/{RETURN_TO_OMBUDSMAN_DAYS})");
            else
                return (false, $"Cannot return - Exceeded {RETURN_TO_OMBUDSMAN_DAYS} day limit by {daysSinceReceived - RETURN_TO_OMBUDSMAN_DAYS} day(s)");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error checking return eligibility: {ex.Message}");
            return (false, "Error checking eligibility");
        }
    }

    /// <summary>
    /// Update SLA status
    /// </summary>
    public void UpdateSLAStatus(string caseNo, string status)
    {
        try
        {
            var tracker = GetSLATracking(caseNo);
            if (tracker != null)
            {
                _slaTracking[_slaTracking.IndexOf(tracker)] = tracker with { Status = status };
                _logger.LogInformation($"SLA status updated for {caseNo}: {status}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating SLA status: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Get all overdue cases
    /// </summary>
    public List<SLATracking> GetOverdueCases()
    {
        return _slaTracking
            .Where(s => s.Status == "overdue")
            .OrderBy(s => s.RemainingDays)
            .ToList();
    }

    /// <summary>
    /// Refresh all SLA tracking (recalculate remaining days)
    /// Call this periodically (e.g., midnight job)
    /// </summary>
    public void RefreshAllSLATracking()
    {
        foreach (var tracker in _slaTracking)
        {
            var remainingDays = (int)(tracker.Deadline - DateTime.Now).TotalDays;
            var isNearDeadline = remainingDays < (ALERT_THRESHOLD_MONTHS * 30);
            var status = remainingDays <= 0 ? "overdue" : "in-progress";

            var index = _slaTracking.IndexOf(tracker);
            _slaTracking[index] = tracker with 
            { 
                RemainingDays = Math.Max(0, remainingDays),
                IsNearDeadline = isNearDeadline,
                Status = status
            };
        }

        _logger.LogInformation("All SLA tracking refreshed");
    }

    /// <summary>
    /// Get SLA statistics
    /// </summary>
    public (int Total, int Alert, int Overdue, int OnTrack) GetSLAStatistics()
    {
        var total = _slaTracking.Count;
        var alert = _slaTracking.Count(s => s.IsNearDeadline);
        var overdue = _slaTracking.Count(s => s.Status == "overdue");
        var onTrack = total - alert - overdue;

        return (total, alert, overdue, onTrack);
    }
}
