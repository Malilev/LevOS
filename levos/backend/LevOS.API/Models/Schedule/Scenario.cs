namespace LevOS.API.Models.Schedule;

public class Scenario
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public double WakeUp { get; set; }
    public double? OpStart { get; set; }
    public HomeWindow? HomeWindow { get; set; }
    public bool CanGym { get; set; }
    public string? ArriveBy { get; set; }
    public string? Note { get; set; }
    public bool IsWeekend { get; set; }
}

public class HomeWindow
{
    public double Start { get; set; }
    public int Duration { get; set; }
}
