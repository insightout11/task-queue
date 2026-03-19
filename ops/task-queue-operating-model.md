# Task Queue — Operating Model

**Version:** 2
**Authors:** Max, Matt
**Purpose:** This queue answers one question: *what can happen next, who can do it, and what kind of action path does it need?*

It is a dispatch board and routing system — not a project management tool.

---

## Core question the board answers

- What can Max do right now without Matt?
- What belongs in the Claude Code queue?
- What specifically needs Matt at a computer?
- What is waiting on a quick answer or decision from Matt?
- What is blocked externally?
- What just got done?
- When Matt says "move to the next thing" — what is actually next?

---

## Lane model

### Inbox
**Slug:** `inbox`
**Icon:** ↓
**Purpose:** Temporary intake. Unsorted items land here before being routed to the correct lane.
**Rule:** Nothing lives here permanently. Every item in Inbox has a next step: route it or delete it.

---

### Max Can Do Now
**Slug:** `max-now`
**Icon:** →
**Purpose:** Tasks Max can act on independently, right now. No Matt dependency. No CC dependency. No external blocker.
**Examples:** Writing, research, spec drafting, decisions Max can make solo.
**Rule:** If it needs Matt to be present or to answer something first, it does not belong here.
**Ordering:** Sorted by `order` field first, then priority, then recency. The top card is what Max should do next.

---

### CC Queue
**Slug:** `cc-queue`
**Icon:** ◈
**Purpose:** Tasks ready to be executed by Claude Code.
**Rule:** A task is only CC-ready if it has:
- `specPath` — path to a spec, prompt file, or implementation brief
- `definitionOfDone` — clear criteria for when CC's work is complete

Tasks missing either field will show a "not CC-ready" warning on the card.
**Ordering:** Sorted by `order` field first, then priority. The top card is what CC should be working on.

---

### Needs Matt at Computer
**Slug:** `needs-matt-computer`
**Icon:** ⌨
**Purpose:** Tasks that require Matt to be physically at a device. Cannot be resolved by chat alone.
**Examples:** Browser attach, Stripe login, local file upload/download, copy-paste from a local machine, running a local test.
**Field:** `requiredAction` — describes exactly what Matt needs to do at the computer.
**Rule:** If Matt can resolve it by replying in chat, it belongs in *Waiting on Matt*, not here.
**Ordering:** Sorted by `order` field first, then priority.

---

### Waiting on Matt
**Slug:** `waiting-matt`
**Icon:** ?
**Purpose:** Tasks blocked on a quick Matt answer, decision, confirmation, approval, or preference. Can likely be resolved by a chat reply.
**Examples:** Confirm pricing tiers, approve a design direction, pick between two options, give a go/no-go.
**Field:** `requiredAction` — describes the specific question or decision needed.
**Rule:** This is distinct from *Needs Matt at Computer*. If Matt needs to physically touch something, route to Needs Matt at Computer instead.
**Ordering:** Sorted by `order` field first, then priority.

---

### Blocked External
**Slug:** `blocked-external`
**Icon:** ✕
**Purpose:** Tasks blocked by something outside Max/Matt/Claude Code.
**Examples:** Provider outage, Stripe approval pending, third-party credentials not yet available, deploy pipeline broken, pending external review.
**Field:** `blockedReason` — what exactly is blocked and why.
**Rule:** Nothing to action here. Items move out when the external blocker resolves.
**Ordering:** Sorted by most recently updated.

---

### Done / Recent
**Slug:** `done`
**Icon:** ✓
**Purpose:** Recently completed tasks. Provides visibility and confirmation that things are getting done.
**Rule:** This is not an archive. It should stay recent-focused. Pruning/archiving is post-v1.
**Ordering:** Most recently completed first.

---

## Task data model

```typescript
interface Task {
  id: string;
  title: string;
  lane:
    | 'inbox'
    | 'max-now'
    | 'cc-queue'
    | 'needs-matt-computer'
    | 'waiting-matt'
    | 'blocked-external'
    | 'done';
  project: 'system' | 'lessoncaptain' | 'dizzyspinner' | 'marketing' | 'ops' | 'admin' | 'other';
  owner: 'max' | 'matt' | 'claude-code' | 'other';
  priority: 'high' | 'medium' | 'low';
  order?: number;           // explicit in-lane position (lower = first)
  statusNote?: string;      // short context note
  specPath?: string;        // path to spec/prompt file — required for CC Queue
  sourcePath?: string;      // path to source code being referenced
  blockedReason?: string;   // what is the external blocker (Blocked External)
  requiredAction?: string;  // what specifically needs to happen (Needs Matt / Waiting on Matt)
  definitionOfDone?: string; // clear done criteria — required for CC Queue
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
}
```

---

## Ordering logic

| Lane | Sort order |
|------|-----------|
| Inbox | `createdAt` descending |
| Max Can Do Now | `order` asc → priority rank → `updatedAt` desc |
| CC Queue | `order` asc → priority rank → `updatedAt` desc |
| Needs Matt at Computer | `order` asc → priority rank → `updatedAt` desc |
| Waiting on Matt | `order` asc → priority rank → `updatedAt` desc |
| Blocked External | `updatedAt` descending |
| Done / Recent | `updatedAt` descending |

Tasks without an explicit `order` value sort as if `order = ∞` (go to bottom of priority group).

**In-lane "next" indicator:** The first card in each actionable lane is marked `↑ next` — this is the answer to "what's first in this lane?"

---

## Project is metadata, not structure

Project/domain (`lessoncaptain`, `dizzyspinner`, etc.) exists as a badge and filter. It does not determine which lane a task lives in. Lane = action path. Project = domain context.

---

## CC Queue prep rules

A task is CC-ready when:
1. `specPath` is set — points to a spec, prompt, or implementation brief
2. `definitionOfDone` is set — clear statement of when CC's work is complete

Tasks in CC Queue missing either field show a `⚠ Not CC-ready` warning. They should be prepped before CC picks them up.

---

## Quick-move routing map

| From | Can move to |
|------|-------------|
| Inbox | Max Can Do Now, CC Queue, Needs Matt, Waiting on Matt |
| Max Can Do Now | Done, CC Queue, Needs Matt, Waiting on Matt |
| CC Queue | Done, Max Can Do Now, Blocked External |
| Needs Matt at Computer | Done, Max Can Do Now, Waiting on Matt |
| Waiting on Matt | Max Can Do Now, Needs Matt, Done |
| Blocked External | Max Can Do Now, CC Queue, Needs Matt |
| Done | Max Can Do Now, CC Queue |

---

## Source of truth

- **File:** `ops/task-queue.json`
- **Format:** `{ "tasks": Task[] }` — flat array, no nesting
- **Write strategy:** Write to `.tmp` then `renameSync` to avoid partial-write corruption
- **Git-backed:** Yes — committed alongside the codebase
- **No database:** Intentional. Single-user, synchronous I/O, always inspectable.
