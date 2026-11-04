# Architecture

KhulanSense is a no-build, dependency-free browser app served by `server.js`.

1. `data/` stores the source CSVs. `public/app.js` parses quoted CSV fields, validates rows, derives daily collar features and calculates causal anomaly features.
2. UI pages consume the same in-memory processed cohort. SVG charts use those tables directly. Feature and episode exports are derived from the rendered cohort, not a parallel pipeline.
3. The monitoring layer provides structured read tools and a deterministic policy. Optional Groq invokes these tools over an OpenAI-compatible chat-completions endpoint. Decision records contain timestamp, cutoff, action, evidence and tool trace; browser local storage never receives the key.
4. The experiment runner uses seeded controlled shifts and compares named policies under the same event windows. Exports include event labels and trial-level metrics.

No server endpoint accepts user data, API keys, or decisions. The server is a static file server bound to localhost.
