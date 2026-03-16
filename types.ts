// --- ONTOLOGY DEFINITION ---

// (A) Source Nodes
export type SourceNodeType = 
  | 'SOURCE_DOCUMENT' 
  | 'PASSAGE' 
  | 'QUOTE' 
  | 'SPEAKER';

// (B) Conceptual Nodes
export type ConceptualNodeType = 
  | 'CONCEPT' 
  | 'DISTINCTION' 
  | 'CLAIM' 
  | 'DEFINITION' 
  | 'PARADOX' 
  | 'APORIA'
  | 'SILENCE_DISCLOSURE'
  | 'METHODOLOGY';

// (C) Phenomenology Nodes
export type PhenomenologyNodeType = 
  | 'EXPERIENCE_PATTERN' 
  | 'AFFECTIVE_STATE' 
  | 'COGNITIVE_MODE' 
  | 'PRACTICE';

// (D) Lived Session Nodes
export type SessionNodeType = 
  | 'USER_UTTERANCE' 
  | 'SESSION' 
  | 'INTERPRETIVE_FRAME';

// (E) Safety & Boundary Nodes
export type SafetyNodeType = 
  | 'CLINICAL_MARKER' 
  | 'SPIRITUAL_MARKER' 
  | 'BOUNDARY_RULE';

// Union of all 21 types
export type NodeType = 
  | SourceNodeType 
  | ConceptualNodeType 
  | PhenomenologyNodeType 
  | SessionNodeType 
  | SafetyNodeType;

// Section 10.1: Minimal Data Model Fields
export type ConfidenceLevel = 'EVIDENCED' | 'INFERRED' | 'SPECULATIVE';

export interface Node {
  id: string;
  type: NodeType;
  val: number; // radius/importance (visual weight)
  label: string;
  description?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  
  // Section 10.1 Implementation
  provenance?: string[]; // Source pointers (Section 9.3/10.1)
  confidence?: ConfidenceLevel; // 0-1 mapped to enum
  lens?: string[]; // e.g. 'Void_as_Presence'
  ren_chapter?: string[]; // e.g. 'Ch1', 'Ch2'
  
  // Phenomenological Topology Visuals
  repulsion_factor?: number; // Physics override (default: 0)
  visual_mode?: 'SOLID' | 'GHOST' | 'void_anchor'; // Rendering style
  
  // OMEGA-EPISTEMICS-3: Drift & Anchoring
  distance_from_anchor?: number; // 0 = Direct Source, >3 = Fog of War
  
  // OMEGA-CHRONOS-5: Transience Engine
  created_tick?: number;
  decayed_tick?: number | null;

  metadata?: {
    speaker?: string;
    sourcePointer?: string; // Legacy support, prefer provenance
    [key: string]: any;
  };
}

// Edge Categories (for visualization styling)
export type LinkCategory = 
  | 'EVIDENCE'       // cites, supports, attributed_to
  | 'CONCEPTUAL'     // subtype_of, entails, defines
  | 'PARADOX'        // negates, has_pole, tension_vector
  | 'TOPOLOGY'       // belongs_to (REN structure)
  | 'UNIVERSALITY'   // appears_in, invariance_cluster
  | 'BOUNDARY'       // signals, constrained_by
  | 'METHODOLOGICAL'; // applied_to, structures

export interface Link {
  source: string | Node;
  target: string | Node;
  value: number; // thickness/strength
  relationship: string; // The specific verb (e.g., "negates", "supports")
  category: LinkCategory; // The broad category for visual styling
}

// OMEGA-DRIFT-NATIVE: Physics Types
export type Edge = Link;

export interface NodePhysics {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  instability: number;
}

// OMEGA-CORPUS-8: Master Document Structure
export interface MasterDocumentSection {
  id: string;
  title: string;
  content: string; // The definition/synthesis
  source_node_id: string; // The node representing the file/author
  voice_signature: string; // e.g. "Cioran-esque", "Rumi-esque"
  timestamp: number;
}

export type IngestionStatus = 'IDLE' | 'PARSING' | 'ANALYZING' | 'INTEGRATING' | 'COMPLETE' | 'ERROR';

export interface GraphData {
  nodes: Node[];
  links: Link[];
  vector_clock?: number; // OMEGA-CHRONOS-5: Global time state
  master_document?: MasterDocumentSection[]; // OMEGA-CORPUS-8
}

// Chat Types
export type ThinkingMode = 'auto' | 'fast' | 'deep';

// Section 10.2: Query Intents
export type QueryIntent = 
  | 'NAVIGATION' 
  | 'DEFINITION' 
  | 'COMPARISON' 
  | 'PHENOMENOLOGY' 
  | 'BOUNDARY' 
  | 'WORKFLOW_EXECUTION' // New for Method Stack
  | 'UNKNOWN';

// Workflow Artifacts (PDF Specification)

export interface AdversarialPhase {
  phase: 'STEELMAN' | 'RED_TEAM' | 'FORMALIZE' | 'COUNTERMODEL' | 'REPAIR';
  content: string;
  metadata?: any;
}

export interface AdversarialLedger {
  thesis: string;
  status: 'INITIATED' | 'COMPLETED' | 'FAILED';
  history: AdversarialPhase[];
  robustness_score: number;
}

export interface ConceptAudit {
  term: string;
  status: 'APPROVED' | 'FLAGGED';
  ambiguity_ratio: number;
  definitions: string[];
  canonical_definition?: string;
}

export interface PhiQLResult {
  query: string;
  type: 'WHY' | 'TRACE' | 'COUNTEREX' | 'REPAIR';
  result: any;
}

export type Artifact = 
  | { type: 'ADVERSARIAL_LEDGER'; data: AdversarialLedger }
  | { type: 'CONCEPT_AUDIT'; data: ConceptAudit }
  | { type: 'PHI_QL_RESULT'; data: PhiQLResult };

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isThinking?: boolean;
  moduleSignature?: string; // [TRN], [DA], [EIA], [SE], [LV], [PIE]
  intent?: QueryIntent;     // [INTENT: ...]
  modelUsed?: string;
  isSanitized?: boolean; // OMEGA-PURITY-6: Guardrail Flag
  artifact?: Artifact;   // New: Attached workflow output
}

export type ProcessingState = 'idle' | 'thinking' | 'speaking' | 'listening' | 'error';

// Logic Validation Types
export interface ValidationIssue {
  code: string;
  message: string;
  severity: 'warning' | 'error';
  nodeId?: string;
}

// ZENITH Evaluation Ledger Metrics
export interface ValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
  metrics: {
    rigor: number;             // Claim Density & Structure
    phenomFidelity: number;    // Presence of phenomenological nodes
    antiReification: number;   // Inverse of reification triggers
    evidenceDensity: number;   // Claims with evidence / Total Claims
    paradoxIntegrity: number;  // Well-formed paradoxes
  };
}
