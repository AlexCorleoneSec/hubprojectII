# HubProject — Design System

> Dark-only. Purple-accented. Glass depth. Geist type.

---

## Direction

Minimal dark UI with a single strong accent (`#7c5cfc`). Depth via layered surfaces + borders + selective blur — not shadows. Motion is fast (300ms) with expo-out easing. Everything breathes at 4px.

---

## Color Tokens

### Surfaces (darkest → lightest)
```
surface-0   #06060a   — app background, page roots
surface-1   #0a0a12   — sidebar, primary panels
surface-2   #10101c   — card base, row hover
surface-3   #181826   — inputs, secondary UI, badges
surface-4   #1e1e30   — hover overlays, tooltips
```

### Borders
```
border-subtle   #14141f   — internal dividers, section separators
border          #1e1e30   — default border (same as surface-4)
border-hover    #2a2a42   — interactive border on hover
```

### Accent
```
accent            #7c5cfc          — primary interactive, active states
accent-hover      #6a4ce8          — button/link hover
accent-subtle     rgba(124,92,252,0.12)   — tinted backgrounds
accent-glow       rgba(124,92,252,0.25)   — glow halos
```

### Text
```
text-primary    #e8e8f0   — headings, primary content
text-secondary  #8888a4   — labels, descriptions, nav items (inactive)
text-muted      #55556a   — timestamps, meta, placeholders, empty states
```

### Status
```
success   #22c55e   — completed, active
warning   #f59e0b   — pending, at risk
error     #ef4444   — overdue, destructive
info      #3b82f6   — informational
```
Status usage pattern: `bg-{color}/15  text-{color}  border border-{color}/20`

---

## Typography

**Fonts:** Geist Sans (UI) · Geist Mono (code/mono)

| Role | Class | Size |
|------|-------|------|
| Page title | `text-xl font-semibold` | 20px |
| Section heading | `text-lg font-medium` | 18px |
| Card title | `text-sm font-medium` | 14px |
| Body | `text-sm` | 14px |
| Label / meta | `text-xs` | 12px |
| Badge / micro | `text-[11px]` | 11px |
| Timestamp / sub-meta | `text-[10px]` | 10px |

**Table headers:** `text-[11px] font-medium text-text-muted uppercase tracking-wider`  
**Gradient text:** `.text-gradient` → `bg-gradient-accent bg-clip-text text-transparent`

---

## Spacing

Base unit: **4px**. All spacing is a multiple of 4.

| Token | px | Common use |
|-------|----|-----------|
| `1` | 4px | Tight gaps, icon padding |
| `1.5` | 6px | Badge padding, dot gaps |
| `2` | 8px | Component internal gaps |
| `2.5` | 10px | Filter button x-padding |
| `3` | 12px | Card padding, nav item padding |
| `4` | 16px | Standard padding, table cells |
| `5` | 20px | Project card padding |
| `6` | 24px | Section gaps |
| `8` | 32px | Auth card padding |

---

## Border Radius

| Token | Size | Use |
|-------|------|-----|
| `rounded-md` | 6px | Small buttons (sm) |
| `rounded-lg` | 8px | Buttons (default), inputs, nav items |
| `rounded-xl` | 12px | Auth inputs, matrix task cards |
| `rounded-2xl` | 16px | Cards (glass-card), kanban columns |
| `rounded-3xl` | 20px | Extended cards |
| `rounded-full` | pill | Badges, status dots, scrollbar |

---

## Depth Strategy

Depth is built from **surface layering + borders** first. Shadows are reserved for floating/active states.

```
1. Surface color steps  — panels over background (surface-1 > surface-0)
2. border/border-subtle — separating content regions
3. backdrop-blur-xl     — glass cards (60% opacity bg + blur)
4. shadow-glass         — card resting shadow (subtle white ring + dark drop)
5. shadow-glass-hover   — card hover (accent ring + stronger drop)
6. shadow-glow          — dragging items, accent glow (rgba(124,92,252,0.3))
```

**Shadows:**
```
glass        0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)
glass-hover  0 0 0 1px rgba(124,92,252,0.2), 0 8px 32px rgba(0,0,0,0.5)
glow         0 0 20px rgba(124,92,252,0.3)
```

---

## Gradients

```
gradient-accent   linear-gradient(135deg, #7c5cfc 0%, #a855f7 50%, #6366f1 100%)
gradient-card     linear-gradient(180deg, rgba(124,92,252,0.06) 0%, transparent 100%)
gradient-glow     radial-gradient(ellipse at top, rgba(124,92,252,0.15) 0%, transparent 60%)
```

Background grid: `rgba(124,92,252,0.03)` lines at 48px intervals.

---

## Components

### Button
```
Base: inline-flex items-center gap-2 rounded-lg text-sm font-medium transition-all duration-200

default   h-9 px-4    — gradient-accent + glow shadow, white text
sm        h-8 px-3    — rounded-md, text-xs
lg        h-11 px-6   — text-base
icon      h-9 w-9     — square

Variants:
  default     bg-gradient-accent, shadow-glow, hover:brightness-110
  secondary   bg-surface-3 border border-border, hover:bg-surface-4
  ghost       text-text-secondary, hover:bg-surface-3 hover:text-text-primary
  destructive bg-status-error/15 border border-status-error/25
```

### Input
```
h-9 w-full rounded-lg px-3
bg-surface-3 border border-border
text-sm text-text-primary placeholder:text-text-muted
hover:border-border-hover
focus:ring-2 focus:ring-accent/50 focus:border-accent
```
Auth variant uses `h-11 rounded-xl` with icon padding (`pl-10`).

### Glass Card
```
.glass-card:
  bg-surface-2/60 backdrop-blur-xl
  border border-border rounded-2xl shadow-glass
  + gradient-card overlay (subtle purple top fade)

hover: border-border-hover shadow-glass-hover
```
Internal padding varies: `p-3` (dense), `p-4` (default), `p-5` (project cards), `p-8` (auth).

### Badge
```
rounded-full px-2.5 py-0.5 text-xs font-medium border

default     bg-accent-subtle text-accent border-accent/20
success     bg-success/15 text-success border-success/20
warning     bg-warning/15 text-warning border-warning/20
error       bg-error/15 text-error border-error/20
muted       bg-surface-3 text-text-muted border-border-subtle
```

### Status Dot
```
w-1.5 h-1.5 rounded-full (inline color indicator)
w-2 h-2 rounded-full (larger variant — kanban/matrix headers)
w-2.5 h-2.5 rounded-sm (matrix quadrant icon)
```

### Nav Item (Sidebar)
```
flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-all

active:   text-text-primary bg-surface-3
          + absolute left-0 w-0.5 h-4 bg-accent rounded-full (accent bar)
inactive: text-text-secondary hover:text-text-primary hover:bg-surface-2
```

### Table
```
Header row: border-b border-border
  th: px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wider

Body row: border-b border-border-subtle hover:bg-surface-2/50

Cell padding: px-4 py-3
```

### Kanban Column
```
w-72 min-w-72 shrink-0 rounded-2xl
header: flex items-center gap-2 px-3 py-2
cards:  space-y-2 overflow-auto px-1

drop-active: bg-accent-subtle/30
```

---

## Motion

**Library:** Framer Motion throughout.

```
Standard entry:   { opacity: 0, y: 8 } → { opacity: 1, y: 0 }  0.3s ease-out
Page entry:       { opacity: 0, y: 20 } → animate   0.5s [0.23, 1, 0.32, 1]
Staggered list:   delay: index * 0.05s
Sidebar width:    duration: 0.2s ease: [0.23, 1, 0.32, 1]
Active indicator: layoutId="sidebar-active", duration: 0.2s
```

CSS animations:
```
fade-in      0.3s ease-out  (opacity 0→1)
slide-up     0.3s ease-out  (opacity + translateY 8px→0)
glow-pulse   2s ease-in-out infinite  (shadow intensity oscillation)
```

---

## Layout

```
Sidebar:    w-60 (240px) collapsed → w-16 (64px), h-screen, bg-surface-1
Topbar:     h-14, border-b border-border-subtle
Content:    flex-1 overflow-auto
```

Kanban: horizontal scroll, `flex gap-4`  
Dashboard: `grid cols-1 md:cols-2 lg:cols-3 gap-4`  
Matrix: `grid grid-cols-2 gap-3`

---

## Icons

**Library:** `lucide-react`

| Size | Class | Use |
|------|-------|-----|
| 12px | `w-3 h-3` | Inline micro icons, calendar, drag handle |
| 14px | `w-3.5 h-3.5` | Table icons, subtle indicators |
| 16px | `w-4 h-4` | Standard nav/button icons |
| 24px | `w-6 h-6` | Empty state icons |

---

## Scrollbar

```css
width: 6px; height: 6px;
thumb: bg-border-hover rounded-full
thumb:hover: bg-text-muted
track: transparent
```

---

## Patterns to Preserve

- **Glass cards** always use `.glass-card` — never raw `bg + border` on elevated content.
- **Status tinting:** always `color/15` bg + `color/20` border, never solid fills.
- **Accent glow on primary actions:** `shadow-[0_0_20px_rgba(139,92,246,0.3)]` at rest, stronger on hover.
- **No light mode** — `color-scheme: dark` is forced at html level.
- **Drag states:** `rotate-2 scale-105 shadow-glow` on active drag overlay.
- **Group hover reveals:** action buttons use `opacity-0 group-hover:opacity-100`.
- **Empty states:** always `glass-card` with centered icon in `w-12 h-12 rounded-full bg-accent-subtle`.
