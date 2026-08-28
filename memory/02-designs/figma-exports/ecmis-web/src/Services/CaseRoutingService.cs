using EcmisWeb.Data;

namespace EcmisWeb.Services;

/// <summary>
/// Case Routing Service
/// One-Click decision making for:
/// - Accept and assign to investigation
/// - Return to ombudsman (ป.ป.ช.) within 15 days
/// - Send to discipline department (สพท.)
/// </summary>
public class CaseRoutingService
{
    private List<CaseRoutingDecision> _routingDecisions = new();
    private readonly SLATrackingService _slaService;
    private readonly ILogger<CaseRoutingService> _logger;

    public CaseRoutingService(SLATrackingService slaService, ILogger<CaseRoutingService> logger)
    {
        _slaService = slaService;
        _logger = logger;
    }

    /// <summary>
    /// Accept case and assign to investigation unit
    /// </summary>
    public async Task<CaseRoutingDecision> AcceptCaseAsync(
        string caseNo, 
        string assignedToUnit, 
        string assignedToOfficer,
        string createdBy)
    {
        try
        {
            var decision = new CaseRoutingDecision
            {
                Id = _routingDecisions.Count + 1,
                CaseNo = caseNo,
                RoutingDecision = "accept",
                AssignedToUnit = assignedToUnit,
                AssignedToOfficer = assignedToOfficer,
                DecisionDate = DateTime.Now,
                CreatedBy = createdBy,
                CreatedDate = DateTime.Now
            };

            _routingDecisions.Add(decision);
            _slaService.UpdateSLAStatus(caseNo, "in-progress");

            _logger.LogInformation($"Case accepted and assigned: {caseNo} -> {assignedToUnit}");
            return decision;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error accepting case: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Return case to Ombudsman (ป.ป.ช.) - Must be within 15 days
    /// </summary>
    public async Task<CaseRoutingDecision> ReturnToOmbhudsmanAsync(
        string caseNo,
        string returnReason,
        string createdBy)
    {
        try
        {
            // Check if return is within 15-day limit
            var (canReturn, reason) = _slaService.CanReturnToOmbudsman(caseNo);
            if (!canReturn)
            {
                _logger.LogWarning($"Cannot return case (outside 15-day window): {caseNo} - {reason}");
                throw new InvalidOperationException($"Cannot return case: {reason}");
            }

            var decision = new CaseRoutingDecision
            {
                Id = _routingDecisions.Count + 1,
                CaseNo = caseNo,
                RoutingDecision = "returnToOmbudsman",
                ReturnReason = returnReason,
                ReturnDate = DateTime.Now,
                DecisionDate = DateTime.Now,
                CreatedBy = createdBy,
                CreatedDate = DateTime.Now
            };

            _routingDecisions.Add(decision);
            _slaService.UpdateSLAStatus(caseNo, "completed");

            _logger.LogInformation($"Case returned to Ombudsman: {caseNo} - Reason: {returnReason}");
            return decision;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error returning case: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Send case to Discipline Department (สพท.)
    /// </summary>
    public async Task<CaseRoutingDecision> SendToDisciplineAsync(
        string caseNo,
        string disciplineUnit,
        string createdBy)
    {
        try
        {
            var decision = new CaseRoutingDecision
            {
                Id = _routingDecisions.Count + 1,
                CaseNo = caseNo,
                RoutingDecision = "discipline",
                DisciplineUnit = disciplineUnit,
                DecisionDate = DateTime.Now,
                CreatedBy = createdBy,
                CreatedDate = DateTime.Now
            };

            _routingDecisions.Add(decision);
            _slaService.UpdateSLAStatus(caseNo, "completed");

            _logger.LogInformation($"Case sent to Discipline: {caseNo} -> {disciplineUnit}");
            return decision;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending case to discipline: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Get routing decision for a case
    /// </summary>
    public CaseRoutingDecision? GetRoutingDecision(string caseNo)
    {
        return _routingDecisions.FirstOrDefault(r => r.CaseNo == caseNo);
    }

    /// <summary>
    /// Update routing decision (add audit log)
    /// </summary>
    public async Task UpdateRoutingDecisionAsync(
        string caseNo,
        string updatedReason,
        string modifiedBy)
    {
        try
        {
            var decision = GetRoutingDecision(caseNo);
            if (decision == null)
                throw new KeyNotFoundException($"Routing decision not found: {caseNo}");

            var audit = new AuditLog
            {
                Id = decision.AuditLogs.Count + 1,
                CaseNo = caseNo,
                Action = "Update",
                OldValue = decision.ReturnReason,
                NewValue = updatedReason,
                ModifiedBy = modifiedBy,
                ModifiedDate = DateTime.Now
            };

            decision.AuditLogs.Add(audit);
            decision.ModifiedBy = modifiedBy;
            decision.ModifiedDate = DateTime.Now;

            _logger.LogInformation($"Routing decision updated: {caseNo}");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating routing decision: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Get all routing decisions
    /// </summary>
    public List<CaseRoutingDecision> GetAllRoutingDecisions()
    {
        return _routingDecisions;
    }

    /// <summary>
    /// Get routing statistics
    /// </summary>
    public (int Accepted, int ReturnedToOmbudsman, int SentToDiscipline) GetRoutingStatistics()
    {
        var accepted = _routingDecisions.Count(r => r.RoutingDecision == "accept");
        var returned = _routingDecisions.Count(r => r.RoutingDecision == "returnToOmbudsman");
        var discipline = _routingDecisions.Count(r => r.RoutingDecision == "discipline");

        return (accepted, returned, discipline);
    }
}
