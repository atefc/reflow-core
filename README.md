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
- Fully written in TypeScript with strong type safety.

---

## Installation

```bash
git clone https://github.com/atefc/reflow-core.git
cd reflow-core
yarn
```

## Usage
yarn start


## Testing
yarn test
