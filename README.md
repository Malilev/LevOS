# LEV OS 2.0

> A personal weekly planning system for high-performers who refuse to choose between career excellence and family presence.

## What's New in 2.0

LEV OS 2.0 is a complete rebuild with a **week-first** approach and **scenario-based planning**.

### Key Features

- **Week View**: See all 7 days at once with 30-minute slots (7:00 - 03:30)
- **Scenario System**: Quick daily setup based on your schedule type
- **4 Tabs**: Plan, Triggers, Goals, Brain Dump
- **Project Contexts**: Day priorities with automatic task filtering
- **Weekly Metrics**: Track progress per project

---

## Philosophy

LEV OS is built on a simple truth: **you can't manage time, you can only manage energy and attention**.

This isn't another todo app. It's a cognitive operating system designed for someone who:
- Performs surgery in the morning
- Builds startups in the afternoon
- Raises a family in the evening
- Does deep research at night

---

## Scenarios

Tap any day header to quickly set up the day:

| Scenario | Description | Wake Up | Use When |
|----------|-------------|---------|----------|
| **1st** | First in queue | 7:00 | Surgery at 9:00 |
| **2nd** | Second in queue | 8:00 | Surgery at 10-11 |
| **3rd** | Third in queue | 10:30 | Surgery at 12-15, big morning window |
| **4+** | Late queue | 11:30 | Surgery after 15:00, can hit the gym |
| **Weekend** | Family day | 11:00 | No surgery |

Each scenario auto-generates:
- Sleep block (8h before wake time)
- Road blocks (travel to/from hospital)
- Buffer blocks (decompression)
- Family time (50min after work)
- Work window based on day's project context

---

## The Four Tabs

### 1. Plan
Weekly calendar with drag-and-drop blocks. Tap a block to move it, tap a slot to place it.

**Block Categories:**
- **Operations**: 1/2/3 surgeries (red)
- **Sacred**: Family time, walks (purple)
- **Work**: Polechat, Somalab, Lab (blue/orange/violet)
- **Care**: Sport, SPA, Power Nap (green)
- **Night**: Deep work sessions (indigo)
- **Free**: Hyperfocus, personal time (yellow)

### 2. Triggers
Context-aware if-then rules that adapt to your scenario:

```
Morning:  Woke up → brush teeth → vitamins → note
Road:     Left home → check mode (recover/reactive/attack)
Hospital: 30min → reactive, 60min → attacks, 120min+ → deep work
Evening:  50min done → next task, YouTube urge → do 1 thing first
Sleep:    Lying down → write "tomorrow", then brush teeth
```

### 3. Goals
Hierarchical goals with time horizons:
- **D** (Day) — today's must-dos
- **W** (Week) — this week's targets
- **M** (Month) — monthly objectives
- **Q** (Quarter) — quarterly milestones

Filter by project to focus on what matters now.

### 4. Brain Dump
Capture everything immediately. Tag by project. Convert to goals when ready.

> "Get it out of your head so your head can work."

---

## Project Contexts

Each day has a priority project:

| Day | Default Context |
|-----|----------------|
| Mon-Wed | Polechat (startup) |
| Thu | Lab (research) |
| Fri | Somalab (venture) |
| Sat-Sun | Family |

The Triggers tab shows relevant brain dump items and goals for today's context.

---

## Smart Defaults

- **Auto-blocks**: Placing surgery auto-generates road + buffer + family time
- **Sleep overflow**: Sleep blocks that cross midnight display correctly on the next day
- **Duration limits**: Each block has min/max duration to prevent over-scheduling
- **Night hours**: 00:00-03:30 are first-class planning slots (purple zone)

---

## Technical Stack

- React 18 (CDN, no build step)
- Tailwind CSS
- localStorage for persistence
- PWA-ready (installable on mobile)
- Single HTML file (~60KB)

---

## Installation

### Option 1: GitHub Pages
1. Fork this repository
2. Enable Pages in Settings → Pages
3. Access at `username.github.io/LevOS`

### Option 2: Netlify Drop
1. Download this repository
2. Go to https://app.netlify.com/drop
3. Drag the folder onto the page

### Option 3: Local
Just open `index.html` in a browser. Data persists in localStorage.

---

## Mobile Installation

**iOS Safari:** Share → Add to Home Screen

**Android Chrome:** Menu → Install App

**Samsung Internet:** Menu → Add to Home Screen

---

## Customization

Long-press any block to edit:
- Emoji
- Color
- Name
- Default duration
- Min/max duration

All settings persist locally.

---

## The Name

**LEV** means "Lion" in Russian. Also the creator's name.

**OS** because this isn't an app you open occasionally — it's the operating system for daily life decisions.

---

## License

MIT — Use it, fork it, make it yours.

---

*Built with obsessive attention to the details of one person's life. May it serve yours.*
