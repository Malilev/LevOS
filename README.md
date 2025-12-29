# 🦁 LEV OS

> A personal daily planning system for high-performers who refuse to choose between career excellence and family presence.

## Philosophy

LEV OS is built on a simple truth: **you can't manage time, you can only manage energy and attention**. 

This isn't another todo app. It's a cognitive operating system designed for someone who:
- Performs surgery in the morning
- Builds startups in the afternoon  
- Raises a newborn in the evening
- Does deep research at night

### Core Principles

#### 1. Operations First (Anchor Blocks)
Surgery doesn't move. Investor calls don't reschedule. These are **anchor blocks** — immovable points around which everything else flows. Place them first, and the system automatically calculates what's possible.

#### 2. Sacred Time is Non-Negotiable
Family blocks aren't "nice to have" — they're load-bearing walls. When you place an operation, the system automatically schedules:
- **Buffer time** before (mental preparation)
- **Buffer time** after (decompression)
- **Family time** immediately after buffer
- **Maya Walk** if the 14:00-17:00 window is free

You can move these. But they appear by default. Because defaults shape behavior.

#### 3. Eat the Frog
Hard cognitive work (legal reviews, grant applications, difficult emails) must happen before easy dopamine tasks. The system originally enforced this — soft work was locked until hard work was logged.

#### 4. Owl Mode Optimization
Some people peak at 6 AM. Others at 2 AM. LEV OS includes night hours (00:00-04:00) as first-class planning slots, with smart limits based on tomorrow's first commitment. If surgery is at 8 AM, the system warns you that deep work must end by midnight.

#### 5. Sport Entry Constraints
Gym closes at 23:00, but you must **enter before 17:00** on weekdays. This constraint is real — it comes from an actual gym membership. The system calculates available entry windows around your operation schedule. Weekends have no restrictions.

### Time Blocks

| Category | Blocks | Purpose |
|----------|--------|---------|
| **Anchor** | OP_1, OP_2 | Surgical operations (3h or 6h) |
| **Sacred** | FAM, MAYA_WALK | Non-negotiable family time |
| **Work** | PoleChat Legal/BizDev/Product | Startup work by cognitive load |
| **Startup** | SomaLab | Second venture |
| **Science** | Deep, Light | Publications, grants, emigration tickets |
| **Lab** | Deep, Light | Research lab administration |
| **Care** | Sport+SPA, Sport, Power Nap | Physical recovery |
| **Night** | NIGHT | Deep work during peak hours (00:00-03:00) |
| **Calls** | Various | Recurring team calls (appear on specific days) |

### Smart Defaults

- **NIGHT block**: 8 hours default (it's your peak cognitive window, not a quick session)
- **Buffers**: 30 min before OP (prep), 30 min after (decompress)
- **Sport windows**: Calculated based on OP placement and 17:00 entry deadline
- **Night limit**: Automatically calculated from tomorrow's first task minus 8h sleep

### Design Decisions

**Why 30-minute slots?**
Because 15 minutes is too granular for strategic planning, and 60 minutes loses precision. Surgery starts at 8:30, not 8:00.

**Why auto-generated family blocks?**
Because when you're exhausted after 6 hours of surgery, you won't remember to schedule family time. The system remembers for you. You can delete it — but you have to consciously choose to.

**Why show calls only on specific days?**
Monday is PoleChat sync day. Thursday is SomaLab tech review. These don't need to clutter Tuesday's planning view.

**Why local storage, not cloud sync?**
Privacy. Speed. Simplicity. Your surgical schedule doesn't belong on someone else's server. And offline-first means it works in the hospital basement.

---

## The Name

**LEV** (Лев) means "Lion" in Russian. Also the user's name.

**OS** because this isn't an app you open occasionally — it's the operating system for daily life decisions.

---

## Technical Stack

- Pure React (no framework)
- Tailwind CSS
- localStorage for persistence
- PWA-ready (installable on mobile)
- Single HTML file (portable, no build step)

---

## Installation

### Option 1: Netlify Drop (30 seconds)
1. Download and unzip `lev-os-github.zip`
2. Go to https://app.netlify.com/drop
3. Drag the folder onto the page
4. Done — you get a live URL

### Option 2: GitHub Pages
1. Create repository `lev-os`
2. Upload all files
3. Enable Pages in Settings
4. Access at `username.github.io/lev-os`

### Option 3: Local
Just open `index.html` in a browser. Data persists in localStorage.

---

## Mobile Installation

**iOS Safari:** Share → Add to Home Screen

**Android Chrome:** Menu → Install App / Add to Home Screen

**Samsung Internet:** ☰ → Add page to → Home Screen

---

## Customization

Press ⚙️ to:
- Add custom blocks
- Edit existing blocks (emoji, color, duration, min/max)
- Set recurring call days
- Reset to defaults

All settings persist locally.

---

## Roadmap Ideas

- [ ] Sleep configurator (custom sleep need: 7-9h)
- [ ] Week view
- [ ] Statistics dashboard
- [ ] Export/import data
- [ ] Cloud sync (optional, encrypted)
- [ ] Telegram bot integration for quick logging

---

## License

MIT — Use it, fork it, make it yours.

---

*Built with obsessive attention to the details of one person's life. May it serve yours.* 
