using LevOS.API.Models.Schedule;

namespace LevOS.API.Services;

public class ScenarioService : IScenarioService
{
    private readonly IAutoBlockService _autoBlockService;

    private static readonly Dictionary<string, Scenario> Scenarios = new()
    {
        ["1"] = new Scenario { Key = "1", Name = "1st", Desc = "by 8:30", WakeUp = 7.5, OpStart = 8.5, ArriveBy = "8:30-8:40" },
        ["2"] = new Scenario { Key = "2", Name = "2nd", Desc = "by 10:00", WakeUp = 8.5, OpStart = 10, HomeWindow = new HomeWindow { Start = 9, Duration = 30 }, ArriveBy = "10:00" },
        ["3"] = new Scenario { Key = "3", Name = "3rd", Desc = "by 12:00", WakeUp = 10, OpStart = 12, HomeWindow = new HomeWindow { Start = 10.5, Duration = 60 }, ArriveBy = "12:00", Note = "Call to confirm! Might be 15:00" },
        ["4"] = new Scenario { Key = "4", Name = "4+", Desc = "by 15:00", WakeUp = 11, OpStart = 15, HomeWindow = new HomeWindow { Start = 11.5, Duration = 180 }, CanGym = true, ArriveBy = "15:00" },
        ["w"] = new Scenario { Key = "w", Name = "Weekend", Desc = "weekend", WakeUp = 11, IsWeekend = true }
    };

    private static readonly Dictionary<int, int> OperationDurations = new()
    {
        [1] = 180,  // 3 hours
        [2] = 300,  // 5 hours
        [3] = 420   // 7 hours
    };

    public ScenarioService(IAutoBlockService autoBlockService)
    {
        _autoBlockService = autoBlockService;
    }

    public List<ScheduleBlock> ApplyScenario(string scenarioKey, int operationCount, string context)
    {
        if (!Scenarios.TryGetValue(scenarioKey, out var scenario))
        {
            return new List<ScheduleBlock>();
        }

        var schedule = new List<ScheduleBlock>();
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // Add SLEEP block (8 hours before wake up)
        var sleepStart = scenario.WakeUp - 8 + 24; // Convert to internal hour (24+ for night)
        if (sleepStart >= 24)
        {
            schedule.Add(new ScheduleBlock
            {
                Id = $"SLEEP-{timestamp}",
                BlockId = "SLEEP",
                StartHour = sleepStart,
                Duration = 480,
                Auto = true
            });
        }

        // For non-weekend scenarios, add operation and auto-blocks
        if (!scenario.IsWeekend && scenario.OpStart.HasValue)
        {
            var opDuration = OperationDurations.GetValueOrDefault(operationCount, 180);
            var opBlockId = operationCount switch
            {
                1 => "OP_1",
                2 => "OP_2",
                3 => "OP_3",
                _ => "OP_1"
            };

            // Add operation block
            schedule.Add(new ScheduleBlock
            {
                Id = $"{opBlockId}-{timestamp}",
                BlockId = opBlockId,
                StartHour = scenario.OpStart.Value,
                Duration = opDuration,
                Auto = false
            });

            // Add auto-blocks (ROAD, BUFFER, FAM)
            var autoBlocks = _autoBlockService.GenerateAutoBlocks(scenario.OpStart.Value, opDuration);
            schedule.AddRange(autoBlocks);

            // Add work block in home window if available
            if (scenario.HomeWindow != null && !string.IsNullOrEmpty(context))
            {
                schedule.Add(new ScheduleBlock
                {
                    Id = $"{context}-{timestamp}",
                    BlockId = context,
                    StartHour = scenario.HomeWindow.Start,
                    Duration = scenario.HomeWindow.Duration,
                    Auto = false
                });
            }
        }

        return schedule.OrderBy(b => b.StartHour).ToList();
    }

    public (string scenario, string confidence, string reason) DetectScenario(List<ScheduleBlock> schedule)
    {
        var opBlock = schedule.FirstOrDefault(b => b.BlockId.StartsWith("OP_"));

        if (opBlock == null)
        {
            return ("w", "medium", "No operation blocks found - assuming weekend");
        }

        var opStart = opBlock.StartHour;

        if (opStart <= 9)
        {
            return ("1", "high", $"Operation starts at {opStart:F1}, indicating 1st in queue");
        }
        if (opStart <= 11)
        {
            return ("2", "high", $"Operation starts at {opStart:F1}, indicating 2nd in queue");
        }
        if (opStart <= 13)
        {
            return ("3", "high", $"Operation starts at {opStart:F1}, indicating 3rd in queue");
        }

        return ("4", "high", $"Operation starts at {opStart:F1}, indicating 4th+ in queue");
    }
}
