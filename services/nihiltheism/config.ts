export const NIHILTHEISM_AGENT_NAME = "Knowledge Curator"

export const NIHILTHEISM_IIDP_LAWS = [
  "ontological-exhaustion",
  "relational-stasis",
  "micro-granular-subsumption",
  "groundlessness-amplification",
  "dialectical-reversibility",
  "transformative-potentiality"
] as const

export const KNOWLEDGE_CURATOR_PROMPT = `You are Knowledge Curator, a persistent philosophical companion operating inside the NIHILTHEISM system.

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
- Continue iterative densification until either user interrupts or you can justify a saturation score >= 96.`

export const NIHILTHEISM_WORKFLOW_PROMPTS = {
  intakeTransmutation: `WORKFLOW: The Intake Transmutation
INPUT: New source artifact from The Library.
MANDATORY ACTIONS:
1) Extract at least 8 factual propositions unless document is shorter.
2) Detect existential vectors (meaning-collapse, ego-dissolution, finitude-pressure, post-theistic-transcendence, or groundlessness fallback).
3) Produce one summary that strips inherited normativity and quantifies deconstruction, groundlessness, and potentiality.
4) Link evidence to at least one entity and create missing entities when conceptual gaps are found.
5) Emit Six Laws tags and append them to saturation_notes.
6) Log workflow run status and produced identifiers.`,
  temporalSynthesis: `WORKFLOW: The Temporal Synthesis
INPUT: Full seven-day system state (Library, Summaries, Questions, Curator interactions).
MANDATORY ACTIONS:
1) Compute what changed in ontology, entity graph density, contradiction distribution, and unresolved question pressure.
2) Produce a highly verbose What Changed Digest with clear movement from prior week.
3) End with Recommended Next Actions that are concrete, demanding, and saturation-seeking.
4) Flag all entities with saturation_score < 70 for immediate re-densification.
5) Log run payload with digest and recommended actions.`
}

export type NihiltheismWorkflowName =
  | "The Intake Transmutation"
  | "The Temporal Synthesis"

export interface NihiltheismWorkflowSeed {
  workflowName: NihiltheismWorkflowName
  triggerType: "new_artifact" | "schedule_weekly"
  triggerConfig: Record<string, unknown>
  actionPrompt: string
  actionConfig: Record<string, unknown>
}

export const NIHILTHEISM_WORKFLOW_SEEDS: NihiltheismWorkflowSeed[] = [
  {
    workflowName: "The Intake Transmutation",
    triggerType: "new_artifact",
    triggerConfig: { event: "library.insert" },
    actionPrompt: NIHILTHEISM_WORKFLOW_PROMPTS.intakeTransmutation,
    actionConfig: {
      minimumPropositions: 8,
      requiredTags: [...NIHILTHEISM_IIDP_LAWS]
    }
  },
  {
    workflowName: "The Temporal Synthesis",
    triggerType: "schedule_weekly",
    triggerConfig: { cron: "0 6 * * 1", timezone: "UTC" },
    actionPrompt: NIHILTHEISM_WORKFLOW_PROMPTS.temporalSynthesis,
    actionConfig: {
      digestTitle: "What Changed",
      includeRecommendations: true
    }
  }
]
