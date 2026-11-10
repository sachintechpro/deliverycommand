# DeliveryCommand — Enterprise Project Recovery Simulator

**Interactive Senior Project Manager portfolio case study:** Diagnose a delayed insurance IT program, choose recovery actions, see critical-path and budget changes, and export an executive recommendation.

> **Important:** All program data, costs, durations, forecasts, and owners are fictional. The model is deterministic and illustrative—not a promise of recovery, employer data, or a substitute for an approved integrated master schedule.

## What a hiring manager can explore

- **Diagnose:** Review an initial **10-week schedule delay**, a RED delivery status, program evidence, and a sample RAID register.
- **Recover:** Select from five interventions covering vendor escalation, integration staffing, targeted QA automation, phased delivery, and compressed UAT.
- **Validate:** Inspect recalculated earliest starts, finish-to-start dependencies, task float, and the current critical path.
- **Report:** Review revised finish, estimate at completion, forecast budget variance, quality exposure, governance warnings, and an executive recommendation. Export the brief or JSON.

The **unmitigated case** starts at Week 20, with an approved Week 33 finish and forecast Week 43. Approved budget is $4.0M; actual spend $2.7M and estimated base remaining $1.6M, so baseline estimate at completion is $4.3M. Intervention costs are scenario assumptions. The current forecast is always compared with the **original baseline**, never silently rebaselined.

## Design notes

- `engine.mjs`: Pure scheduling and cost engine. Calculates earliest start/finish, late-pass float, critical path, budget, remaining slip, and warning messages.
- `app.mjs`: Browser interactions, data presentation, report export, and printing.
- `index.html` and `styles.css`: Responsive employer-facing interface.
- `tests/engine.test.mjs`: Node built-in unit tests including all 32 intervention combinations.
- `server.py`: Minimal local/Render server with no third-party Python dependencies.
- `.github/workflows/test.yml`: CI runs `node --test` on every push or pull request.

**Explicit limitations:** The cost model assumes the base work estimate remains constant except for intervention costs or stated scope savings. It does not simulate productivity curves, stochastic uncertainty, resource calendars, actual regulatory reviews, or mutually exclusive resource conflicts. Acceleration options require validation and approval. RAG thresholds are defined for this case study, not an enterprise standard.

## Run locally

From the repository root:

```bash
python server.py
```

Open `http://localhost:10000`. You can use another port by setting the `PORT` environment variable.

Run model tests (Node.js 20+):

```bash
node --test tests/*.test.mjs
```

## Deploy on Render

Create a new **Web Service** connected to this GitHub repository:

- Runtime: **Python 3**
- Build command: `echo "No dependencies"`
- Start command: `python server.py`

The service listens on `PORT` as supplied by Render. Alternatively, publish as a static site with no build command.

## Suggested employer walkthrough (3 minutes)

1. Start at the Red status and review evidence before escalating blame.
2. Inspect the vendor → integration → SIT → UAT → cutover critical path.
3. Select vendor acceleration, then explain its cost and dependency assumptions.
4. Compare a scope deferral and a shortened UAT; point out required approvals and residual risk.
5. Export an executive brief explaining the forecast, RAG status, funding gap, and next actions.

**Portfolio framing:** An independently built, fictional case study inspired by common enterprise IT delivery recovery challenges. It does not contain any hiring manager's, client's, or previous employer's confidential information.
