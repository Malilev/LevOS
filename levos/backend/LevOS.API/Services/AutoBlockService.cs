using LevOS.API.Models.Schedule;

namespace LevOS.API.Services;

public class AutoBlockService : IAutoBlockService
{
    private const int ROAD_DURATION = 25;
    private const int BUFFER_DURATION = 30;
    private const int FAM_DURATION = 50;
    private const double MIN_ROAD_START = 7.0; // Don't add ROAD before 7:00
    private const double MAX_FAM_END = 22.0;   // Don't add FAM after 22:00

    public List<ScheduleBlock> GenerateAutoBlocks(double operationStart, int operationDuration)
    {
        var blocks = new List<ScheduleBlock>();
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // ROAD before operation (if starts after 7:00)
        if (operationStart >= MIN_ROAD_START)
        {
            var roadStart = operationStart - (ROAD_DURATION / 60.0);
            blocks.Add(new ScheduleBlock
            {
                Id = $"ROAD-{timestamp}-pre",
                BlockId = "ROAD",
                StartHour = RoundToHalfHour(roadStart),
                Duration = ROAD_DURATION,
                Auto = true
            });
        }

        // Calculate operation end
        var operationEnd = operationStart + (operationDuration / 60.0);

        // BUFFER after operation
        blocks.Add(new ScheduleBlock
        {
            Id = $"BUFFER-{timestamp}",
            BlockId = "BUFFER",
            StartHour = RoundToHalfHour(operationEnd),
            Duration = BUFFER_DURATION,
            Auto = true
        });

        // FAM after buffer (if ends before 22:00)
        var famStart = operationEnd + (BUFFER_DURATION / 60.0);
        var famEnd = famStart + (FAM_DURATION / 60.0);

        if (famEnd <= MAX_FAM_END)
        {
            blocks.Add(new ScheduleBlock
            {
                Id = $"FAM-{timestamp}",
                BlockId = "FAM",
                StartHour = RoundToHalfHour(famStart),
                Duration = FAM_DURATION,
                Auto = true
            });
        }

        return blocks;
    }

    private static double RoundToHalfHour(double hour)
    {
        return Math.Round(hour * 2) / 2;
    }
}
