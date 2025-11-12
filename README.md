# Reflow Core

**Reflow Core** is a TypeScript-based scheduling service designed to manage and optimize manufacturing work orders across multiple work centers. It accounts for dependencies between work orders, shift schedules, and maintenance windows, ensuring an efficient and conflict-free production plan.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)

---

## Features

- Automatically sort work orders based on dependencies.
- Detect and resolve scheduling conflicts within the same work center.
- Respect shift schedules for each work center.
- Adjust work orders around planned maintenance windows.
- Track changes and delays when work orders are rescheduled.

---

## Installation

```bash
git clone https://github.com/atefc/reflow-core.git
cd reflow-core
yarn
```

## Usage
### Overview of the main 
The main entry point demonstrates how to use the ReflowService with different scheduling scenarios:

### Start the reflow application
```bash
    yarn start
```
This will execute all predefined scenarios and print results to the console.

🟢 Scenario 1 - Simple

Basic case with sequential work orders that fit perfectly within shift hours and have no conflicts or maintenance.

🔵 Scenario 2 - Long Weekend

A work order starts on Friday but requires more time than one day’s shift.
The system automatically pauses on Friday evening and resumes on Monday morning, skipping the weekend when no shifts are available.

🔴 Scenario 3 - Conflict

Two work orders overlap in the same work center.
The system detects the overlap and pushes the later order forward to start after the previous one finishes.
...
🟣 Scenario 7 - Combined Complex

A full test with multiple dependencies, overlapping work centers, and maintenance windows — demonstrating the complete behavior of the reflow engine.

### Output overview
```
===== Running Scenario 8 - Overlap with Maintenance =====

Updated Work Orders:
WO-007-1: 2025-11-12T11:00:00.000Z - 2025-11-12T12:30:00.000Z

Changes:
WO7-1: 2025-11-12T09:30:00.000Z -> 2025-11-12T11:00:00.000Z, 2025-11-12T11:30:00.000Z -> 2025-11-12T12:30:00.000Z, delay: 60 mins

Explanations:
- Work Order WO7-1 delayed due to maintenance window from 2025-11-12T10:00:00.000Z to 2025-11-12T11:00:00Z in Work Center WC1.
- Work Order WO7-1 end date adjusted from 2025-11-12T11:30:00Z to 2025-11-12T12:30:00.000Z after maintenance in Work Center WC1.
```
## Testing
yarn test
