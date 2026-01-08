using LevOS.API.Models.Schedule;

namespace LevOS.API.Services;

public interface IAutoBlockService
{
    List<ScheduleBlock> GenerateAutoBlocks(double operationStart, int operationDuration);
}
