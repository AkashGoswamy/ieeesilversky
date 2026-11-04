# Methodology

## Observational unit and source

One row is a collar-day. Longitude/latitude are reported daily track centroids. Waterpoint coordinates are withheld. Missing rows represent missing observation coverage and are not converted into observed non-visits.

## Signals

Great-circle distance is computed between adjacent observed centroids and divided by elapsed calendar days only when the gap is at most three days; this remains centroid displacement, not path length or GPS speed. Initial speed values are unavailable by definition. A trailing median/MAD Hampel step caps outliers once a historical baseline exists; a trailing mean smooths the cleaned signal. Visits retain the source count on observed days. Seven- and thirty-day rate windows use only observed visit values and require minimum coverage. Days-since-visit is shown only after a recorded visit. Environmental values remain missing when no previous value is available; up to three consecutive gaps on observed days can carry forward the last prior measurement, and the source-missing flag remains set.

## Detection

A lagged trailing median/MAD standardizes smoothed speed and 30-day visit rate. A two-sided CUSUM accumulates evidence with reset at threshold. A configurable persistence condition flags candidate episodes. Confidence is not calibrated probability; uncertainty combines recent coverage and available baseline. NDVI seasonal deviation uses same-day-of-year measurements from up to two prior years only, with at least five reference observations. The dashboard calls these candidate signal deviations.

## Decision policy

The deterministic rule checks observation quality, multi-channel deviations, change points, environmental context and uncertainty. It maps evidence to a review priority (routine, observe, flag, escalate) while retaining the supporting feature values. It does not infer a water shortage. Groq is a constrained optional orchestrator over read-only structured tools; it cannot modify source data or automatically dispatch field teams.

## Population summaries

Monthly summaries and environmental bins are descriptive. The cohort periodogram uses population daily means with at least five observed collars, fills only internal short population gaps of ten days or less for this spectrum, removes a linear trend, applies a Hann window, and normalizes each signal's power by its own maximum. The waterpoint-use seasonality table shows the source's aggregate identifiers and monthly shares; it does not assign spatial coordinates.
