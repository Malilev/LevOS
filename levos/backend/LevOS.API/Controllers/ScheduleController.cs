using Microsoft.AspNetCore.Mvc;
using LevOS.API.DTOs;
using LevOS.API.Services;

namespace LevOS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController : ControllerBase
{
    private readonly IAutoBlockService _autoBlockService;
    private readonly IScenarioService _scenarioService;

    public ScheduleController(IAutoBlockService autoBlockService, IScenarioService scenarioService)
    {
        _autoBlockService = autoBlockService;
        _scenarioService = scenarioService;
    }

    /// <summary>
    /// Generate auto-blocks (ROAD, BUFFER, FAM) for an operation
    /// </summary>
    [HttpPost("auto-blocks")]
    public ActionResult<GenerateAutoBlocksResponse> GenerateAutoBlocks([FromBody] GenerateAutoBlocksRequest request)
    {
        var blocks = _autoBlockService.GenerateAutoBlocks(request.OperationStart, request.OperationDuration);
        return Ok(new GenerateAutoBlocksResponse { Blocks = blocks });
    }

    /// <summary>
    /// Apply a scenario to generate a full day schedule
    /// </summary>
    [HttpPost("apply-scenario")]
    public ActionResult<ApplyScenarioResponse> ApplyScenario([FromBody] ApplyScenarioRequest request)
    {
        var schedule = _scenarioService.ApplyScenario(request.Scenario, request.OperationCount, request.Context);
        return Ok(new ApplyScenarioResponse
        {
            Schedule = schedule,
            Scenario = request.Scenario
        });
    }

    /// <summary>
    /// Detect scenario from existing schedule
    /// </summary>
    [HttpPost("detect-scenario")]
    public ActionResult<DetectScenarioResponse> DetectScenario([FromBody] List<Models.Schedule.ScheduleBlock> schedule)
    {
        var (scenario, confidence, reason) = _scenarioService.DetectScenario(schedule);
        return Ok(new DetectScenarioResponse
        {
            Scenario = scenario,
            Confidence = confidence,
            Reason = reason
        });
    }
}
