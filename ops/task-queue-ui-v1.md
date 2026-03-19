# Task Queue UI v1 — Max / Matt Internal System

Date: 2026-03-19
Status: implementation spec
Owner: Max

## Purpose
This is the internal task queue UI for **our system**.

It is not:
- a customer-facing feature
- a generic PM tool
- a LessonCaptain feature

It is:
- Max’s working memory surface
- Matt’s operational visibility surface
- the place where active work, queued work, blocked work, and CC-bound work are kept from drifting into chat sludge

The core job of this UI is to reduce:
- forgetting
- project/context drift
- duplicate work
- “what were we doing again?” confusion
- tasks getting trapped in chat instead of becoming operational objects

---

## Core principles

### 1. Operational, not decorative
This UI exists to make work visible and movable.
It should not feel like PM theater.

### 2. Small number of clear lanes
A task should be easy to place at a glance.
The lanes must mean something.

### 3. Project separation matters
We need to avoid mixing:
- Max system work
- LessonCaptain work
- DizzySpinner work
- Ops / infrastructure work
- Marketing work
- personal/admin tasks

### 4. CC-bound work must be explicit
If something belongs in Claude Code, that should be obvious.
It should not live as a vague note in chat.

### 5. File-backed, durable, inspectable
The queue should not depend on transient chat memory.
It should read/write durable structured data.

---

## Main lanes
These are the core queue lanes we already need.

## 1. Inbox
Purpose:
- unsorted capture
- raw tasks not yet triaged
- things that came from chat and need to be placed properly

Rule:
- Inbox is temporary
- items should not live here long

---

## 2. Now
Purpose:
- highest-priority active work
- things Max or Matt should not lose sight of
- current execution lane

Rule:
- keep this tight
- this should be the smallest lane
- if too many things are in Now, the lane stops helping

---

## 3. Next
Purpose:
- valid upcoming work
- important, but not active right this second
- ready to be pulled into Now when capacity opens

Rule:
- this is the main staging lane
- if something matters but is not immediate, it goes here

---

## 4. Waiting / CC
Purpose:
- items handed to Claude Code or another external worker
- items waiting on implementation/report/output
- tasks that are in motion but not locally actionable right now

Rule:
- this lane should make it obvious what has already been delegated
- every item here should link to its implementation/spec file if one exists

---

## 5. Blocked
Purpose:
- tasks that cannot move until something else happens
- blocked by Matt
- blocked by CC output
- blocked by credentials/access/data
- blocked by external dependency

Rule:
- blocked reason should be visible
- this lane should answer “what is stuck and why?”

---

## 6. Done / Recent
Purpose:
- recently completed work
- short-term visibility before archive/pruning
- proof that things moved

Rule:
- keep recent completions visible for a while
- do not let this become a permanent graveyard wall

---

## Lane summary
The queue should answer:
- **Inbox** = what still needs triage?
- **Now** = what matters right now?
- **Next** = what should probably happen after that?
- **Waiting / CC** = what has already been handed off?
- **Blocked** = what is stuck?
- **Done / Recent** = what just got finished?

---

## Task object model
Minimum useful task fields:

- `id`
- `title`
- `lane` (`inbox|now|next|waiting|blocked|done`)
- `project`
- `owner`
- `priority`
- `statusNote` (short visible note)
- `specPath` (optional path to implementation/spec doc)
- `sourcePath` (optional path to originating file/task)
- `blockedReason` (optional)
- `createdAt`
- `updatedAt`

Optional but useful later:
- `tags`
- `dueLabel`
- `ccLabel` or `delegateTarget`
- `doneAt`

### Required enumerations

#### `project`
Should be one of a small stable set, e.g.:
- `system`
- `lessoncaptain`
- `dizzyspinner`
- `marketing`
- `ops`
- `admin`
- `other`

#### `owner`
Should be simple and explicit:
- `max`
- `matt`
- `claude-code`
- `other`

#### `priority`
Keep simple:
- `high`
- `medium`
- `low`

---

## Visual structure
Recommended v1 UI:

## grouped lane board
A compact multi-column or stacked-lane board showing:
- Inbox
- Now
- Next
- Waiting / CC
- Blocked
- Done / Recent

### Preferred layout behavior
- desktop: multi-column board
- smaller widths: stacked sections

### Each task card should show
- title
- project badge
- owner badge
- priority indicator
- short note / status line
- spec/doc link if present

### Card tone
Cards should feel:
- compact
- readable
- operational
- low-noise

Not:
- giant kanban tiles
- bloated cards
- decorative nonsense

---

## Sorting rules

### Default lane ordering
- Inbox: newest first
- Now: highest priority first, then most recently updated
- Next: priority first
- Waiting / CC: most recently updated first
- Blocked: most recently updated first
- Done / Recent: newest done first

### Within Now
This lane should visually reward clarity.
A maximum of a few top tasks should feel highlighted.

---

## Required v1 interactions

### Must have
- create task
- edit title / note / project / owner / priority
- move task between lanes
- mark done
- reopen/move back out of done
- set blocked reason
- attach or edit spec file path

### Should have
- quick move actions between common lanes:
  - Inbox → Now
  - Now → Next
  - Now → Waiting / CC
  - Waiting / CC → Now
  - Any → Blocked
  - Any → Done

### Nice if cheap
- filter by project
- filter by owner
- search by title

### Not needed in v1
- comments system
- assignment workflows
- real-time collaboration
- notifications
- subtasks
- recurrence
- labels explosion

---

## Relationship to `active-tasks.md`

### v1 rule
`active-tasks.md` is transitional human-readable state.
The new queue UI should move toward a structured source of truth.

Recommended path:
- create a structured queue data file
- keep `active-tasks.md` as a readable mirror / summary for now
- over time, let the UI-backed structured file become primary

Do **not** depend on chat memory.
Do **not** make `active-tasks.md` the only operational backend forever.

---

## Source of truth recommendation
Use a single structured file as v1 source of truth.

Recommended path:
- `ops/task-queue.json`

This file should contain the queue items in a clean machine-readable format.

Optional mirror/export later:
- `active-tasks.md` generated from it
- or partially synced from it

The key thing is:
## durable structured state first

---

## CC-bound task behavior
Every task in **Waiting / CC** should ideally have:
- `owner = claude-code`
- `specPath` populated
- a short status note describing what is expected

This is important because the queue should make it obvious:
- what is delegated
- what file defines it
- what we’re waiting for

If a task does not yet have a real spec file, it is not ready for CC.

That is an intentional guardrail.

---

## Project/context separation
This queue must help prevent context drift.

### Minimum v1 support
- visible project badge on every card
- project filtering
- lane grouping remains primary, project grouping secondary

### Why
We need to keep visible distinctions between:
- system work
- product work
- marketing work
- ops work

Without that, the queue just recreates the same mixed-soup problem chat already has.

---

## Recommended card design
Each card should include:
- task title
- project badge
- owner badge
- small priority marker
- short note/status line
- spec file path (clickable if present)

Optional small footer:
- updated time
- blocked reason if blocked

Design tone:
- compact
- clear hierarchy
- low visual clutter

---

## Suggested visual tone
This is internal system UI, so it should feel:
- calm
- utilitarian
- slightly premium
- easy to scan

Not:
- over-themed
- lesson-themed
- cute
- project-management cosplay

This is not LessonCaptain branding.
This is system tooling.

---

## What ships in v1
- structured queue source file
- lane-based task board
- basic card display
- move tasks between lanes
- edit core task fields
- project and owner visibility
- spec path support
- blocked reason support
- done/recent lane

---

## What waits
- automatic sync back to markdown summaries
- analytics/history views
- notifications
- recurring tasks
- subtasks
- advanced filtering/saved views
- multi-user concurrency concerns

---

## Key design rule
The queue should make it easier to answer:
- what am I doing now?
- what is next?
- what is already delegated?
- what is blocked?
- what file defines the work?

If it does not answer those questions quickly, it failed.

---

## Implementation note for CC
CC should not redesign this.
CC should implement this.

If something is ambiguous, prefer:
- simpler
- calmer
- more operational
- less feature-heavy

---

## Bottom line
This UI exists because chat + notes + memory alone are not enough.

It is the working memory surface for Max and Matt’s system.

The whole point is to stop important work from getting lost, mixed up, or half-remembered.
