# KhulanSense

**Research monitoring for steppe wildlife — signal processing, transparent decisions, and replayable evaluation.**

KhulanSense explores whether causal movement and visitation signals can help prioritize field monitoring of Mongolian khulan (Equus hemionus hemionus). It is a browser application built from scratch around the public Payne et al. (2020) Dryad release. It is a retrospective research prototype, not live telemetry or an ecological diagnosis system.

## Run locally

Requires Node.js 18 or newer. No Python packages, cloud services, or API key are needed for Part 1, the deterministic policy, or the browser-side experiments.

```powershell
npm start
```

Open [http://localhost:4173](http://localhost:4173). The app serves only this project folder. CSV input is local. Groq is optional and is called only when you explicitly run the agent; enter the key in **Settings**. It is held in tab memory and is not written to the project or decision log.

## Research question

Can causal, quality-aware fusion of centroid-derived movement, recorded water visitation, and environmental context produce more useful monitoring priorities than fixed schedules or signal thresholds, while preserving evidence and uncertainty for human review?

## Data and scope

Source: Payne et al. (2020), Dryad dataset DOI [10.5061/dryad.pg4f4qrjw](https://doi.org/10.5061/dryad.pg4f4qrjw). The project includes the two supplied CSV files in `data/`.

The visitation table contains daily collar records, visit counts and duration summaries, daily centroid longitude/latitude, and GPCC rainfall, snow, NDVI, and temperature. Coordinates are daily track centroids, **not raw GPS fixes**. The waterpoint characterization table has aggregate waterpoint-use summaries but no coordinates. The map therefore shows track centroids and inferred density; it never claims a centroid or density peak is a verified waterpoint. No coordinates are invented. A missing collar-day is left missing for measurements, never silently treated as zero visits.

## Application

- **Overview:** cohort, coverage, signal-quality and current retrospective context.
- **Animal Explorer:** a collar-level track, recent daily table, signal context and coverage summary.
- **Movement & signals:** centroid track, visit-density view and causal signal stack (raw step speed, robust despiking, trailing smooth, visit-rate channels, robust z scores, CUSUM alarms and flagged intervals).
- **Visitation:** recorded visits, inter-visit timing and duration summaries.
- **Environment:** rainfall, snow, NDVI, temperature and context summaries.
- **Population:** seasonal summaries, collar comparisons, environmental associations, detrended population spectra and reported waterpoint-use seasonality.
- **Anomaly explorer:** persistent movement/visitation deviations and episode table with downloads.
- **Data quality:** per-collar coverage, missing days, source-level flags, and explicit known limitations.
- **Agentic monitoring:** structured local tools, deterministic policy, optional Groq tool-calling and a visible tool trace.
- **Decision log:** review locally saved decisions with cutoff, evidence and tool traces; export CSV/JSON or clear browser-local history.
- **Experiments:** fixed schedule, signal-only and deterministic context-aware policies evaluated against transparent, seeded synthetic shifts. An optional, user-triggered Groq evaluation compares a small matched onset/background sample; it is never run implicitly.
- **Methods:** assumptions, signal processing, policies and evaluation definitions.

## Methods

For each collar, consecutive observed centroid positions yield great-circle step distance and elapsed-time-normalized centroid displacement (km/day). Large gaps are not annualized into apparent daily movement. Speed uses a trailing Hampel filter and trailing moving average. Visitation includes 7/30-day rates, visit-day probability, days since a recorded visit, and inter-visit intervals. Up to three consecutive missing environmental values can carry forward the last prior measurement on observed days; imputed values remain flagged.

Robust deviations use a lagged trailing median/MAD baseline, two-sided CUSUM provides change-point alarms, and persistence reduces single-day flags. A short trailing coverage score contributes to uncertainty. These are candidate monitoring signals, not proof of water shortage, animal health, or causality. The app labels day-level monitoring as historical replay.

## Part 2: agent

The deterministic policy works without a network or key. It consumes the same processed per-collar features as the charts, checks coverage and signal evidence, and emits a structured action, rationale, evidence and uncertainty. Local tools return bounded, typed snapshots. Optional Groq uses the OpenAI-compatible chat-completions tool-call interface; the agent can call only the registered tools and must return the structured action schema. API key stays in tab memory and is excluded from logs. Never paste a key into a shared screenshot.

## Part 3: experiments

The experiment runner creates seeded synthetic deviations over selected historical collar windows, marks injected intervals as synthetic labels, then compares (1) a fixed periodic schedule, (2) a signal threshold, and (3) an adaptive evidence-and-quality policy. It reports event recall, background trigger-days per 100 animal-days, median detection delay, action-day counts, and runtime. A signal-channel ablation compares movement-only, visitation-only, and fused triggers. The optional Groq experiment explicitly evaluates up to 12 event onsets and 12 sampled background dates using two API calls per case; its JSON export includes tool results and actions. Synthetic labels measure controlled response to artificial shifts only; they do not validate ecological event detection. Background trigger-days are not confirmed false positives because the study has no ecological event labels. Run multiple seeds and inspect exported trial rows before making claims.

## Reproducibility

The included source data are unchanged CSV extracts from the supplied archive. All plots and processing are browser-side; no external chart library or telemetry endpoint is required. The experiment seed is shown and exported. Decisions are stored only in the current browser's local storage. Use **Export** controls to save processed features, episodes, decisions, or trial results as CSV/JSON.

## Documentation

- `docs/architecture.md`
- `docs/methodology.md`
- `docs/experiment_protocol.md`
- `docs/limitations.md`
- `docs/demo_script.md`
- `results/reference_run.json` (metrics and trial-level rows from seed 20261104)

## References

Payne, J. C., et al. (2020). *The influence of environmental variables on water visitation by Asiatic wild asses in the Mongolian Gobi Desert*. Dryad dataset, DOI [10.5061/dryad.pg4f4qrjw](https://doi.org/10.5061/dryad.pg4f4qrjw).
