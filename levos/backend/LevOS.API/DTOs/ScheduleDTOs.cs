using LevOS.API.Models.Schedule;

namespace LevOS.API.DTOs;

public class GenerateAutoBlocksRequest
{
    public double OperationStart { get; set; }
    public int OperationDuration { get; set; }
}

public class GenerateAutoBlocksResponse
{
    public List<ScheduleBlock> Blocks { get; set; } = new();
}

public class ApplyScenarioRequest
{
    public string Scenario { get; set; } = string.Empty;
    public int OperationCount { get; set; } = 1;
    public string Context { get; set; } = string.Empty;
}

public class ApplyScenarioResponse
{
    public List<ScheduleBlock> Schedule { get; set; } = new();
    public string Scenario { get; set; } = string.Empty;
}

public class DetectScenarioResponse
{
    public string Scenario { get; set; } = string.Empty;
    public string Confidence { get; set; } = "low";
    public string Reason { get; set; } = string.Empty;
}
