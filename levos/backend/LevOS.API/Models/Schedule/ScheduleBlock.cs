namespace LevOS.API.Models.Schedule;

public class ScheduleBlock
{
    public string Id { get; set; } = string.Empty;
    public string BlockId { get; set; } = string.Empty;
    public double StartHour { get; set; }
    public int Duration { get; set; }
    public bool Auto { get; set; }
}

public class BlockDefinition
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int Duration { get; set; }
    public int MinDur { get; set; }
    public int MaxDur { get; set; }
}
