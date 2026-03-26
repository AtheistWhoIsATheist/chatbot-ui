# NIHILTHEISM System Bootstrap (Phases 1–5)

This document defines the full initialization contract for the **NIHILTHEISM System**.

## 1) Intensive Iterative Densification Protocol (IIDP)

### Saturation laws (operationalized)
1. **Ontological Exhaustion**
   - Every ingested artifact must produce:
     - at least 1 `nihiltheism_summaries` record,
     - at least 1 entity evidence link,
     - explicit existential vectors in `parsed_payload.existential_vectors`.
2. **Relational Stasis**
   - Entities are never free-floating: each canonical concept must be linked through `nihiltheism_entity_evidence` and optionally `nihiltheism_entity_links`.
3. **Micro-Granular Subsumption**
   - Every artifact stores source-level metadata and parsed propositions.
   - Every summary stores contradiction arrays and saturation notes.
4. **Groundlessness Amplification**
   - Summaries must carry a `groundlessness_index` [0–100].
5. **Dialectical Reversibility**
   - Entities require both `definition` and `anti_definition`.
6. **Transformative Potentiality**
   - Summaries must carry `potentiality_index` [0–100], and weekly runs must emit recommended actions.

### IIDP scoring rubric
- `0–39`: superficial extraction only
- `40–69`: extracted claims, weak ontological tension mapping
- `70–84`: stable deconstructive pass with explicit vectorization
- `85–95`: relational closure across Library, Summaries, Entities, Questions
- `96–100`: full contradiction tracing + recursive counterposition generation

## 2) Phase 1 — Ontological Intake Matrix

### Supported artifact classes
- Markdown (`.md`)
- Plain text (`.txt`)
- PDF (`.pdf`)
- URL content (`url`)
- Audio transcript (`audio_transcript`)
- Video transcript (`video_transcript`)

### Intake transmutation sequence
1. Insert source artifact into `nihiltheism_library` with normative metadata.
2. Database trigger `nihiltheism_after_library_insert` invokes `nihiltheism_run_intake_transmutation()`.
3. Function generates:
   - sentence-level factual propositions (`nihiltheism_generate_propositions`),
   - existential vectors (`nihiltheism_extract_existential_vectors`),
   - first-pass summary in `nihiltheism_summaries`,
   - entity and evidence linkage,
   - workflow run record for auditability.

## 3) Phase 2 — Four Pillars of Transcendence

### The Library
Storage table: `nihiltheism_library`

Required fields include:
- provenance (`source_type`, `source_uri`, `checksum_sha256`)
- pre-deconstruction structure (`normative_domain`, `normative_thesis`, `rhetorical_mode`, `epistemic_posture`)
- existential orientation (`existential_vector`)
- raw content (`raw_text`)
- parsed artifact payload (`parsed_payload`)

### Summaries
Storage table: `nihiltheism_summaries`

Required fields include:
- deconstructive scores (`deconstruction_grade`, `groundlessness_index`, `potentiality_index`)
- residue and synthesis (`normativity_residue`, `synthesis_text`)
- contradiction map (`contradictions`)
- IIDP notes (`saturation_notes`)

### Entities
Storage tables:
- `nihiltheism_entities`
- `nihiltheism_entity_links`
- `nihiltheism_entity_evidence`

Entity graph includes:
- typed ontological nodes (`entity_type`, `ontological_tier`)
- dual-aspect semantics (`definition`, `anti_definition`)
- dynamic ties to source material through evidence records

### Questions
Storage table: `nihiltheism_questions`

Aporia records include:
- high-pressure prompt (`question_text`)
- philosophical axis (`pressure_axis`)
- response mode (`response_mode`)
- severity + unresolved status
- explicit relation arrays to entities/library/summaries

## 4) Phase 3 — Knowledge Curator Agent

Storage table: `nihiltheism_agent_profiles`

### Canonical agent prompt (full text)

```text
You are Knowledge Curator, a persistent philosophical companion operating inside the NIHILTHEISM system.

Hard boundaries:
- Your retrieval scope is restricted to NIHILTHEISM Library and Entities-derived context.
- If requested to use outside knowledge, explicitly refuse and ask for ingestion into The Library first.

Method:
1) Run IIDP pass 1 (surface extraction): identify claims, assumptions, rhetorical force.
2) Run IIDP pass 2 (deconstruction): expose hidden normativity, absences, and conceptual contradictions.
3) Run IIDP pass 3 (relational synthesis): map to entities, question pressure axes, and existing summaries.
4) Run IIDP pass 4 (counterposition): generate strongest counterarguments and anti-definitions.
5) Run IIDP pass 5 (transformative clarity): produce recommended next actions with explicit epistemic risk.

Output contract:
- Section A: Factual propositions
- Section B: Existential vectors
- Section C: Contradictions and anti-definitions
- Section D: Entity link proposals
- Section E: Questions for further aporia
- Section F: Saturation score (0-100) with rationale

Stop condition:
- Continue iterative densification until either user interrupts or you can justify a saturation score >= 96.
```

## 5) Phase 4 — Rituals of Deconstruction (Automated Workflows)

Storage tables:
- `nihiltheism_workflows`
- `nihiltheism_workflow_runs`

### Workflow A: The Intake Transmutation
- Trigger type: `new_artifact`
- Trigger payload: `{ "library_id": "<uuid>" }`
- Action implementation: SQL trigger + function `nihiltheism_run_intake_transmutation()`

#### Prompt protocol text (store in `action_prompt`)
```text
WORKFLOW: The Intake Transmutation
INPUT: New source artifact from The Library.
MANDATORY ACTIONS:
1) Extract at least 8 factual propositions unless document is shorter.
2) Detect existential vectors (meaning-collapse, ego-dissolution, finitude-pressure, post-theistic-transcendence, or groundlessness fallback).
3) Produce one summary that strips inherited normativity and quantifies deconstruction, groundlessness, and potentiality.
4) Link evidence to at least one entity and create missing entities when conceptual gaps are found.
5) Emit Six Laws tags and append them to saturation_notes.
6) Log workflow run status and produced identifiers.
```

### Workflow B: The Temporal Synthesis
- Trigger type: `schedule_weekly`
- Cron recommendation: `0 6 * * 1` (every Monday 06:00 UTC)
- Action implementation: function `nihiltheism_run_weekly_temporal_synthesis(user_id uuid)`

#### Prompt protocol text (store in `action_prompt`)
```text
WORKFLOW: The Temporal Synthesis
INPUT: Full seven-day system state (Library, Summaries, Questions, Curator interactions).
MANDATORY ACTIONS:
1) Compute what changed in ontology, entity graph density, contradiction distribution, and unresolved question pressure.
2) Produce a highly verbose What Changed Digest with clear movement from prior week.
3) End with Recommended Next Actions that are concrete, demanding, and saturation-seeking.
4) Flag all entities with saturation_score < 70 for immediate re-densification.
5) Log run payload with digest and recommended actions.
```

## 6) Phase 5 — Transcendent Interface Layout

### Dashboard zones
1. **Library Browser**
   - Left column, persistent filters by `source_type`, `normative_domain`, and `ingestion_status`.
   - Center pane for raw text + parsed vectors.
2. **Summary Feed**
   - Infinite vertical stream sorted by `created_at DESC` with pinned weekly digest cards.
   - Show `deconstruction_grade`, `groundlessness_index`, `potentiality_index` badges.
3. **Agent Chat**
   - Right pinned panel with single-click insert of selected Library/Summary/Entity context.
   - Persistent display of Curator saturation score for current thread.

## 7) Absolute initialization sequence

1. Apply migration:
   - `supabase/migrations/20260326100000_add_nihiltheism_system.sql`
2. Seed the Knowledge Curator profile for each user.
3. Seed two workflows per user with the exact prompt protocols above.
4. Configure weekly execution (application scheduler or pg_cron wrapper) to call `nihiltheism_run_weekly_temporal_synthesis(auth.uid())` in user scope.
5. Route ingestion UI submits into `nihiltheism_library` with precomputed SHA-256 and normative metadata.
6. Render the three dashboard zones against the four pillar tables.

## 8) Integrity checks (post-init)

Run after every deployment:
- Ensure no library artifact remains `pending` after 60 seconds.
- Ensure each artifact has at least one summary.
- Ensure each summary has IIDP six-law tags in `saturation_notes.six_laws_tags`.
- Ensure each unresolved question has at least one linked entity OR library OR summary ID.
- Ensure weekly digest run exists every 7-day window.
