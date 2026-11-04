# Experiment protocol

The dashboard generates reproducible artificial event windows from the observed date range with a user-visible seed. In a trial, an injected step/deviation is assigned to a collar and an interval; this label is synthetic by construction. Policies are evaluated on the same event and background days.

- Fixed schedule: alert at the specified periodic cadence, independent of signals.
- Signal-only: alert when a selected robust signal exceeds its rule threshold.
- Adaptive: signal evidence is combined with quality, environmental context and uncertainty; weak coverage requests observation instead of a confident escalation.
- Ablation: movement-only, visitation-only and fused signal variants.

Reported metrics: event recall, background trigger-days per 100 observed background animal-days, median detection delay in days, action-day count, and measured wall-clock run time. Background days are not verified negatives because ecological event labels are unavailable. The deterministic-policy metrics describe all generated synthetic trials. A separate optional Groq agent sample runs only after an explicit click; it uses up to 12 seeded event-onset and 12 background cases, with one forced tool read and one structured decision request per case. The model never receives the synthetic truth label. This stochastic sample reports onset response and sampled background action rate only; it is not a fair or definitive ranking. Export its tool traces and outcomes as JSON. Compute cost is represented by measured runtime and API use; energy is not instrumented and should not be claimed.
