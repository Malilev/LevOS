using LevOS.API.Models.Schedule;

namespace LevOS.API.Services;

public interface IScenarioService
{
    List<ScheduleBlock> ApplyScenario(string scenarioKey, int operationCount, string context);
    (string scenario, string confidence, string reason) DetectScenario(List<ScheduleBlock> schedule);
}
