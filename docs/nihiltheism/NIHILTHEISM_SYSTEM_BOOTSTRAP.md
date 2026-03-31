# NIHILTHEISM System: Definitive Architecture, Data Model, Workflow Logic, and Operations Manual

This specification is the canonical build-and-run contract for the NIHILTHEISM subsystem implemented in this repository. It defines conceptual intent, relational structure, automation semantics, operational controls, and failure-management logic for a persistent ingestion + deconstruction + synthesis environment.

---

## 0. System Purpose and Operating Scope

The NIHILTHEISM subsystem exists to convert heterogeneous artifacts (documents, links, transcripts) into a recursively structured philosophical knowledge graph. It does this by combining:

1. **Evidence preservation** (The Library).
2. **Interpretive transformation** (Summaries).
3. **Relational concept modeling** (Entities).
4. **Aporia pressure generation** (Questions).
5. **Persistent assistant behavior constraints** (Knowledge Curator).
6. **Deterministic orchestration and accountability** (Workflows + Workflow Runs).

### In-scope outcomes
- Track original source structure before interpretation.
- Produce deconstructive outputs with explicit scores and contradiction capture.
- Anchor every concept to evidence paths (raw and/or synthesized).
- Maintain weekly epistemic change logs.
- Constrain agent behavior to system-contained knowledge.

### Out-of-scope outcomes
- General-purpose autonomous reasoning outside ingested corpus.
- Guaranteed metaphysical “truth”; the subsystem produces structured interpretive artifacts.
- Full scheduler provisioning (cron execution remains application/infra responsibility).

---

## 1. System Topology and Entity-Relationship Map

### 1.1 Primary data domains
- **Ingestion Domain**: `nihiltheism_library`
- **Transformation Domain**: `nihiltheism_summaries`
- **Concept Domain**: `nihiltheism_entities`, `nihiltheism_entity_links`, `nihiltheism_entity_evidence`
- **Aporia Domain**: `nihiltheism_questions`
- **Agent Domain**: `nihiltheism_agent_profiles`
- **Orchestration Domain**: `nihiltheism_workflows`, `nihiltheism_workflow_runs`

### 1.2 Core dependencies
1. A Library artifact is the root input.
2. Insert into Library triggers transmutation function.
3. Transmutation function creates at least one Summary and one Evidence anchor.
4. Evidence anchors connect Entities to Library/Summary records.
5. Workflows represent executable contracts; Workflow Runs represent immutable execution history.
6. Questions reference one or more Entities/Library/Summaries to prevent contextless abstraction.

### 1.3 Integrity hierarchy
- **Hard integrity (DB-enforced)**: keys, foreign keys, checks, uniqueness, RLS.
- **Soft integrity (application-enforced)**: semantic quality thresholds, scheduler cadence, richer extraction quality.

---

## 2. Intensive Iterative Densification Protocol (IIDP)

IIDP is a discipline for ensuring every artifact is represented across propositional, existential, relational, and dialectical layers.

### 2.1 Six Laws of Saturation (operational definitions)
1. **Ontological Exhaustion**
   - Every artifact must map to explicit claims + at least one existential vector.
2. **Relational Stasis**
   - Concept nodes are valid only when linked through evidence and/or typed inter-entity relations.
3. **Micro-Granular Subsumption**
   - Preserve local details (propositions, excerpts) while nesting into global graph structure.
4. **Groundlessness Amplification**
   - Synthesis must register uncertainty, contingency, and non-finality.
5. **Dialectical Reversibility**
   - Every concept requires anti-definition/counterpressure.
6. **Transformative Potentiality**
   - System output must propose action paths rather than ending with static diagnosis.

### 2.2 IIDP scoring band (used by curator and review workflows)
- **0–39**: index-level extraction only, weak conceptual coupling.
- **40–69**: identifiable claims + vectors, partial contradiction handling.
- **70–84**: coherent deconstructive pass + evidence links.
- **85–95**: closed relational loop among Library/Summaries/Entities/Questions.
- **96–100**: iterative counterposition, residual ambiguity account, and strategic next-action specificity.

### 2.3 Why IIDP matters operationally
- Reduces hallucination risk by evidence anchoring.
- Creates reproducible interpretation traces.
- Converts “interesting ideas” into queryable graph material.
- Supports weekly longitudinal epistemic diffing.

---

## 3. Phase 1 — Ontological Intake Matrix (Ingestion Engine)

### 3.1 Accepted source modes
- `md`, `txt`, `pdf`, `url`, `audio_transcript`, `video_transcript`

### 3.2 Ingestion contract (required inputs)
At insert time, each artifact must include:
- provenance: `source_type`, `source_uri`, `checksum_sha256`
- normative framing: `normative_domain`, `normative_thesis`, `rhetorical_mode`, `epistemic_posture`
- existential framing seed: `existential_vector`
- body: `raw_text`

### 3.3 Immediate post-insert behavior
Trigger: `nihiltheism_after_library_insert`

Function: `nihiltheism_run_intake_transmutation()`

Actions:
1. Parse candidate propositions from text.
2. Detect existential vectors with fallback to `groundlessness`.
3. Create first synthesis record with deconstruction/groundlessness/potentiality scores.
4. Upsert baseline concept entity (`Deconstructive Synthesis`).
5. Create evidence record linking source + summary + entity.
6. Update library status to `indexed` and persist parsed payload.
7. Log workflow run when intake workflow exists.

### 3.4 Failure boundaries and expected behavior
- If workflow config absent, core transmutation still completes; run logging is skipped.
- If text lacks vector keywords, fallback vector ensures non-empty existential mapping.
- If upsert target concept exists, definition/signature refresh preserves continuity.

---

## 4. Phase 2 — Four Pillars of Transcendence (Schema Deep Dive)

## 4A. The Library (`nihiltheism_library`)

### Purpose
Stable source-of-truth vault preserving raw inputs plus pre-deconstruction metadata.

### Key fields and rationale
- `checksum_sha256` + unique `(user_id, checksum_sha256)`:
  - deduplicates semantically identical artifacts per user.
- `normative_*` fields:
  - capture inherited ideology/structure before transformation.
- `ingestion_status` (`pending|parsed|indexed|failed`):
  - supports queue visibility and repair operations.
- `parsed_payload`:
  - stores machine-extracted proposition/vector output for traceability.

### Risk/caveat
- sha256 uniqueness is user-scoped; cross-user duplication is intentionally allowed.

## 4B. Summaries (`nihiltheism_summaries`)

### Purpose
Host transformed interpretations and structured deconstructive analytics.

### Key semantics
- `synthesis_version` enables iterative refinement history.
- score triplet:
  - `deconstruction_grade`: depth of normativity stripping.
  - `groundlessness_index`: explicit existential destabilization.
  - `potentiality_index`: constructive action horizon after deconstruction.
- `normativity_residue` prevents false claims of complete abstraction stripping.
- `contradictions` captures unresolved tensions as machine-queryable JSON.
- uniqueness `(library_id, synthesis_version)` prevents version collision.

### Expert caveat
A high `groundlessness_index` without coherent contradictions mapping can indicate performative rather than analytical deconstruction.

## 4C. Entities + Links + Evidence

### `nihiltheism_entities`
Represents canonical concept nodes.

- `entity_type` taxonomy: concept/historical_node/archetype/method/question_form/symbol.
- `definition` and `anti_definition`: mandatory dialectical pair.
- `saturation_score`: graph-level maturity metric (not truth metric).

### `nihiltheism_entity_links`
Represents typed concept-to-concept edges.

- `relation_type` constrains semantic link vocabulary.
- uniqueness `(from_entity_id, to_entity_id, relation_type)` prevents duplicate edges.
- `relation_strength` [0,1] provides confidence-weighted structure.
- self-links prohibited by check constraint.

### `nihiltheism_entity_evidence`
Anchors conceptual claims to source material.

- Requires at least one of `library_id` or `summary_id`.
- Captures excerpt + confidence for provenance-grade trace.

### Structural tension to manage
Dense concept linking without evidence expansion creates graph inflation; enforce evidence growth alongside link growth.

## 4D. Questions (`nihiltheism_questions`)

### Purpose
Store unresolved, high-pressure interrogatives that drive further synthesis.

### Typing controls
- `pressure_axis`: existential dimension classification.
- `response_mode`: method expectation for future analysis.
- `severity` quantifies urgency/intensity.
- relation arrays connect questions to concept/content context.

### Operational guidance
Do not close (`unresolved=false`) unless downstream summaries or evidence materially reduce ambiguity.

---

## 5. Phase 3 — Sovereign Curator (Knowledge Curator Agent)

Storage: `nihiltheism_agent_profiles`

### 5.1 Hard constraints
- `agent_name` must be `Knowledge Curator`.
- `training_scope` fixed to `library_plus_entities_only`.

These constraints formalize bounded-context behavior and prevent silent scope drift.

### 5.2 Canonical prompt (authoritative)

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

### 5.3 Agent failure modes
- Over-generalization not grounded in citations/evidence links.
- False saturation claims (high score with low relational closure).
- External-knowledge leakage violating scope constraints.

### 5.4 Mitigation controls
- Require sectioned output contract.
- Enforce minimum evidence references for high saturation outputs.
- Periodically re-evaluate low-saturation entities in weekly synthesis.

---

## 6. Phase 4 — Rituals of Deconstruction (Workflow Contracts)

Storage:
- `nihiltheism_workflows` (declarative contract)
- `nihiltheism_workflow_runs` (runtime ledger)

## 6A. Workflow A: The Intake Transmutation

### Trigger
`new_artifact` (implemented via DB trigger on Library insert)

### Mandatory outcomes
- proposition extraction
- existential vector extraction
- summary generation
- entity/evidence linkage
- six-law tag emission
- run logging

### Prompt protocol text (canonical)

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

### Reliability notes
- DB-trigger execution guarantees immediate processing at insert boundary.
- For large artifacts, consider asynchronous extension in app layer while preserving DB audit trail.

## 6B. Workflow B: The Temporal Synthesis

### Trigger
`schedule_weekly` (recommended cron: `0 6 * * 1` UTC)

### Function
`nihiltheism_run_weekly_temporal_synthesis(p_user_id UUID)`

### Mandatory outcomes
- weekly system-state scan across Library/Summaries/Questions
- “What Changed” digest payload
- “Recommended Next Actions” payload
- workflow run logging

### Prompt protocol text (canonical)

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

### Strategic significance
Temporal synthesis converts isolated outputs into longitudinal epistemic governance.

---

## 7. Phase 5 — Transcendent Interface Blueprint (Implementation-Ready)

### 7.1 Library Browser
- Left rail filters: `source_type`, `normative_domain`, `ingestion_status`, date range.
- Center detail pane:
  - raw text,
  - parsed propositions,
  - existential vectors,
  - linked summaries/entities/questions.
- Utility actions:
  - re-run transmutation,
  - mark failed artifacts for repair,
  - open source URI.

### 7.2 Summary Feed
- Infinite chronological stream (`created_at DESC`).
- Card metadata:
  - score triplet,
  - contradiction count,
  - residue excerpt,
  - linked entities.
- Pinned weekly cards for “What Changed” digests.

### 7.3 Agent Chat
- Persistent side panel with selected-context injection.
- Conversation view should always show:
  - active IIDP saturation score,
  - referenced entities,
  - unresolved questions generated.
- One-click “convert response to question/entity” actions to keep graph growth low-friction.

### 7.4 UX anti-patterns to avoid
- infinite “philosophical prose” without explicit references.
- scores displayed without explanation.
- unresolved questions decoupled from source evidence.

---

## 8. Initialization Runbook (Absolute Sequence)

1. Apply migration: `supabase/migrations/20260326100000_add_nihiltheism_system.sql`.
2. Insert `Knowledge Curator` profile per user with canonical prompt fields.
3. Seed two workflow records per user:
   - `The Intake Transmutation`
   - `The Temporal Synthesis`
4. Provision scheduler job (app worker or pg_cron wrapper) invoking weekly synthesis per user.
5. Ensure ingestion UI posts complete metadata + SHA-256.
6. Validate trigger-based transmutation with a known test artifact.
7. Confirm workflow run records are generated and queryable.
8. Enable dashboard components against the new tables.

---

## 9. Observability, QA, and Guardrails

### 9.1 Minimum health checks (every deploy)
- No artifacts stuck at `pending` > 60s.
- Every library row has at least one summary.
- Every summary has six-law tags in `saturation_notes.six_laws_tags`.
- Every unresolved question links to at least one contextual ID set.
- Weekly digest run exists within each rolling 7-day window.

### 9.2 Recommended telemetry
- ingestion throughput/day
- transmutation success/failure ratio
- average time artifact→indexed
- evidence density (evidence rows / entity rows)
- unresolved question backlog and median severity
- low-saturation entity count (<70)

### 9.3 Incident triage playbook
1. **Missing summaries**: inspect trigger health + failed transactions.
2. **Vector sparsity**: refine extraction heuristics/app-side enrichment.
3. **Graph inflation**: enforce link-to-evidence ratio threshold.
4. **Weekly run gaps**: inspect scheduler and permission scope.

---

## 10. Security and Multi-Tenant Controls

### 10.1 Row-level security model
All NIHILTHEISM tables are RLS-enabled with own-row policies keyed by `auth.uid()`.

### 10.2 Security implications
- Prevents cross-user data leakage.
- Requires all worker/service execution paths to honor user context.

### 10.3 Operational caution
Service-role backfills must explicitly scope writes by user; avoid global batch scripts without ownership filtering.

---

## 11. Edge Cases, Constraints, and Expert Caveats

1. **Keyword-based vector extraction is conservative**
   - Good baseline, not final semantic detector.
   - Improve with model-assisted extraction in app layer while retaining DB audit events.

2. **Single default concept insertion during intake**
   - Prevents orphaned artifacts early.
   - Should be expanded by orchestrator for richer concept emergence.

3. **Array-based related IDs in Questions**
   - Fast to bootstrap, but denormalized.
   - For high-scale analytics, add junction tables.

4. **Digest quality depends on interaction capture**
   - If chat interactions are not stored in weekly input set, “What Changed” is underpowered.

5. **Score metrics are governance aids, not ontological proof**
   - Treat as progress indicators within system logic.

---

## 12. Forward Extensions (Recommended Roadmap)

1. Add junction tables for question relations (`question_entities`, `question_library`, `question_summaries`).
2. Add materialized views for dashboard speed (`entity_density`, `weekly_drift`).
3. Add retry queue for failed ingestion statuses.
4. Add semantic chunk embeddings for retrieval precision in curator chat.
5. Add contradiction taxonomy for better longitudinal comparison.
6. Add policy for mandatory evidence count before `saturation_score > 90`.

---

## 13. Quick Reference: Canonical Constants and Files

- **Migration (schema + automation):**
  `supabase/migrations/20260326100000_add_nihiltheism_system.sql`
- **Prompt/config constants:**
  `services/nihiltheism/config.ts`
- **This operational spec:**
  `docs/nihiltheism/NIHILTHEISM_SYSTEM_BOOTSTRAP.md`

This document is normative for architecture intent and operating practices; SQL constraints remain the final enforcement layer.
