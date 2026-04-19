import { GraphData, Link, Node, ValidationIssue, ValidationReport } from '../types';
import { REIFICATION_TRIGGERS } from '../constants';

const extractNodeContent = (node: Node): string =>
  `${node.label} ${node.description || ''}`.toLowerCase();

const getLinkNodeId = (endpoint: Link['source'] | Link['target']): string =>
  typeof endpoint === 'string' ? endpoint : endpoint.id;

/**
 * OMEGA-PURITY-6: ONTOLOGICAL AUDIT
 * Detects reification of the Void (Idolatry Check).
 */
export const auditOntology = (node: Node): ValidationIssue | null => {
  // 1. Check for 'Void' presence
    const content = extractNodeContent(node);
    if (!content.includes('void') && !content.includes('nothingness') && !content.includes('emptiness')) {
        return null;
    }

    // 2. Check for Reification Triggers
    const triggerFound = REIFICATION_TRIGGERS.find(trigger => content.includes(trigger.toLowerCase()));
    
    if (triggerFound) {
        return {
            code: 'ONTOLOGICAL_IDOLATRY',
            message: `Node '${node.label}' detects reification via phrase '${triggerFound}'. The Void is not an object; use phenomenological language (SAFE_VERBS).`,
            severity: 'error',
            nodeId: node.id
        };
    }

    return null;
};

/**
 * LOGIC VALIDATION SUITE (LV)
 * Performs strict ontological consistency checks as per ZENITH Protocols.
 */
export const runLogicValidation = (data: GraphData): ValidationReport => {
  const issues: ValidationIssue[] = [];
  const contradictionPairs = new Set<string>();
  let validParadoxes = 0;
  let totalParadoxes = 0;
  let totalClaims = 0;
  let evidencedClaims = 0;
  let reificationErrors = 0;
  let phenomNodes = 0;

  // 0. Pre-process links for O(1) lookups
  const incomingLinks: Record<string, Link[]> = {};
  const outgoingLinks: Record<string, Link[]> = {};
  
  // Initialize
  data.nodes.forEach(n => {
    incomingLinks[n.id] = [];
    outgoingLinks[n.id] = [];
    if (n.type === 'CLAIM') totalClaims++;
    if (n.type === 'PARADOX') totalParadoxes++;
    if (['EXPERIENCE_PATTERN', 'AFFECTIVE_STATE', 'COGNITIVE_MODE', 'PRACTICE'].includes(n.type)) phenomNodes++;
  });

  data.links.forEach(l => {
    const srcId = getLinkNodeId(l.source);
    const tgtId = getLinkNodeId(l.target);
    
    if (outgoingLinks[srcId]) outgoingLinks[srcId].push(l);
    if (incomingLinks[tgtId]) incomingLinks[tgtId].push(l);
  });

  const nodeById = new Map(data.nodes.map(node => [node.id, node]));

  // CHECK 0: OMEGA-PURITY-6 (Ontological Audit & Anti-Reification)
  data.nodes.forEach(n => {
      const issue = auditOntology(n);
      if (issue) {
          issues.push(issue);
          reificationErrors++;
      }
  });

  // CHECK 1: C1_OrphanClaims & EPISTEMIC_OVERREACH (9.1 / 12.3)
  // Claims must be supported by Evidence or explicitly marked speculative
  data.nodes.forEach(n => {
    if (n.type === 'CLAIM') {
      const hasEvidenceLink = incomingLinks[n.id].some(l => l.category === 'EVIDENCE' || l.category === 'TOPOLOGY');
      const hasProvenance = n.provenance && n.provenance.length > 0;
      
      if (hasEvidenceLink || hasProvenance) {
        evidencedClaims++;
        
        // Anti-Failure Check (12.3): Conflicting Epistemology
        if (n.confidence === 'SPECULATIVE') {
            // This is allowed, but maybe worth a note if it HAS evidence but is marked speculative (less critical)
        }
      } else {
        // No evidence. Must be speculative.
        if (n.confidence !== 'SPECULATIVE') {
             issues.push({
                code: 'C1_EPISTEMIC_OVERREACH',
                message: `Claim '${n.label}' is marked '${n.confidence}' but lacks provenance or evidence links.`,
                severity: 'error', // Upgrade to ERROR per Section 12
                nodeId: n.id
             });
        } else {
             issues.push({
                code: 'C1_ORPHAN_SPECULATION',
                message: `Speculative Claim '${n.label}' is floating (orphan).`,
                severity: 'warning',
                nodeId: n.id
             });
        }
      }
    }
  });

  // CHECK 2: C2_ParadoxIntegrity (9.2)
  // Paradoxes must have tension axes (at least 2 connections, usually poles)
  data.nodes.forEach(n => {
    if (n.type === 'PARADOX') {
      const connectedCount = (incomingLinks[n.id] || []).length + (outgoingLinks[n.id] || []).length;
      
      if (connectedCount < 2) {
        issues.push({
          code: 'C2_PARADOX_INCOMPLETE',
          message: `Paradox '${n.label}' has insufficient polar connections (Dangling Paradox).`,
          severity: 'error',
          nodeId: n.id
        });
      } else {
        validParadoxes++;
      }
    }
  });

  // CHECK 3: C5_DistinctionIntegrity (9.1 / 6.4)
  // If Clinical Markers exist, the Boundary Engine must be reachable
  const clinicalMarkers = data.nodes.filter(n => n.type === 'CLINICAL_MARKER');
  const boundaryNode = data.nodes.find(n => n.id === 'Spiritual_vs_MentalHealth');
  
  if (clinicalMarkers.length > 0) {
      if (!boundaryNode) {
        issues.push({
            code: 'C5_MISSING_BOUNDARY_ENGINE',
            message: 'Clinical markers detected but Distinction Engine (Spiritual_vs_MentalHealth) is missing.',
            severity: 'error'
        });
      } else {
          // Check if markers actually connect to the boundary
          const unconnectedMarkers = clinicalMarkers.filter(m => {
              const links = [...incomingLinks[m.id], ...outgoingLinks[m.id]];
              return !links.some(l => {
                  const targetId = typeof l.target === 'string' ? l.target : (l.target as Node).id;
                  const sourceId = typeof l.source === 'string' ? l.source : (l.source as Node).id;
                  return targetId === boundaryNode.id || sourceId === boundaryNode.id;
              });
          });
          
          if (unconnectedMarkers.length > 0) {
              issues.push({
                  code: 'C5_UNBOUND_MARKER',
                  message: `${unconnectedMarkers.length} Clinical Markers are not connected to the Boundary Distinction.`,
                  severity: 'warning'
              });
          }
      }
  }

  // CHECK 4: PHENOMENOLOGICAL TOPOLOGY CHECK (New)
  // Detect DIRECT contradiction between CLAIMS without mediating APORIA
  data.links.forEach(l => {
     // Check for contradiction relationships
     const contradictionTerms = ['contradicts', 'negates', 'opposes', 'conflicts_with'];
     if (contradictionTerms.includes(l.relationship) || l.category === 'PARADOX') {
         const sourceNode = nodeById.get(getLinkNodeId(l.source));
         const targetNode = nodeById.get(getLinkNodeId(l.target));

         if (sourceNode?.type === 'CLAIM' && targetNode?.type === 'CLAIM') {
             const pairKey = [sourceNode.id, targetNode.id].sort().join('::');
             if (contradictionPairs.has(pairKey)) return;
             contradictionPairs.add(pairKey);

             // Direct conflict between claims detected.
             // This violates the topological rule that contradictions must be mediated by an APORIA node.
             issues.push({
                 code: 'MISSING_TOPOLOGY',
                 message: `Direct contradiction between '${sourceNode.label}' and '${targetNode.label}'. Must be mediated by an APORIA node.`,
                 severity: 'warning',
                 nodeId: sourceNode.id // anchor to source
             });
         }
     }
  });

  // ZENITH METRICS CALCULATION
  const rigor = Math.min(1, totalClaims > 0 ? (evidencedClaims / totalClaims) * 1.2 : 1); // Boost for evidenced
  const antiReification = Math.max(0, 1 - (reificationErrors / Math.max(1, data.nodes.length)));
  const phenomFidelity = Math.min(1, phenomNodes / Math.max(1, data.nodes.length * 0.3)); // Target 30% phenom
  const evidenceDensity = totalClaims > 0 ? evidencedClaims / totalClaims : 1;
  const paradoxIntegrity = totalParadoxes > 0 ? validParadoxes / totalParadoxes : 1;

  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    metrics: {
      rigor,
      phenomFidelity,
      antiReification,
      evidenceDensity,
      paradoxIntegrity
    }
  };
};
