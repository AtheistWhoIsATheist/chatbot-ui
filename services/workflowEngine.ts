import { GoogleGenAI, Type } from '@google/genai';
import { AdversarialLedger, ConceptAudit, PhiQLResult, Artifact } from '../types';
import { SYSTEM_INSTRUCTION, MODEL_CHAT_DEEP } from '../constants';

let ai: GoogleGenAI | null = null;

 codex/finalize-and-enhance-entire-codebase-3aea24
const getAI = () => {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
        throw new Error('API_KEY is required to execute workflow commands.');
    }


const getApiKey = (): string => {
    const apiKey = process.env.API_KEY?.trim();
    if (!apiKey) {
        throw new Error('Missing API_KEY. Set API_KEY in your environment before running workflow commands.');
    }
    return apiKey;
};

const getAI = (): GoogleGenAI => {
 main
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: getApiKey() });
    }
    return ai;
};

codex/finalize-and-enhance-entire-codebase-3aea24
const parseStructuredResponse = <T>(text: string | undefined, context: string): T => {
    if (!text || !text.trim()) {
        throw new Error(`Empty JSON response received for ${context}.`);
    }

    try {
        return JSON.parse(text) as T;
    } catch (error) {
        throw new Error(
            `Failed to parse ${context} response as JSON: ${
                error instanceof Error ? error.message : 'Unknown parse error'
            }`
        );
    }
};

type ParsedWorkflowCommand =
    | { command: 'ADVERSARIAL_LOOP'; thesis: string }
    | { command: 'CONCEPT_AUDIT'; term: string }
    | { command: 'PHI_QL'; queryType: 'WHY' | 'TRACE' | 'COUNTEREX' | 'REPAIR'; input: string };

export const parseWorkflowCommand = (input: string): ParsedWorkflowCommand | null => {
    const trimmedInput = input.trim();

    if (trimmedInput.match(/^INITIATE ADVERSARIAL_LOOP/i)) {
        const match = trimmedInput.match(/thesis=["'](.*?)["']/i);
        const thesis = match ? match[1] : trimmedInput.replace(/^INITIATE ADVERSARIAL_LOOP\s*/i, '').trim();
        return { command: 'ADVERSARIAL_LOOP', thesis };
    }

    if (trimmedInput.match(/^RUN CONCEPT_AUDIT/i) || trimmedInput.match(/^AUDIT TERM/i)) {
        const match = trimmedInput.match(/term=["'](.*?)["']/i);
        const term = match
            ? match[1]
            : trimmedInput
                  .replace(/^RUN CONCEPT_AUDIT\s*/i, '')
                  .replace(/^AUDIT TERM\s*/i, '')
                  .trim();
        return { command: 'CONCEPT_AUDIT', term };
    }

    if (trimmedInput.match(/^PHI-QL/i)) {
        const typeMatch = trimmedInput.match(/(?:QUERY\s+)?(WHY|TRACE|COUNTEREX|REPAIR)/i);
        if (!typeMatch) return null;

        const queryType = typeMatch[1].toUpperCase() as ParsedWorkflowCommand['queryType'];
        const contentMatch = trimmedInput.match(/\(["'](.*?)["']\)|["'](.*?)["']/);
        const phiInput = (contentMatch?.[1] || contentMatch?.[2] || '').trim();

        return { command: 'PHI_QL', queryType, input: phiInput };
    }

    return null;
};

=======
const cleanModelJson = (text: string): string =>
    text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

const parseModelJson = <T>(text: string, context: string): T => {
    try {
        return JSON.parse(cleanModelJson(text)) as T;
    } catch (error) {
        throw new Error(`Unable to parse ${context} response as JSON: ${(error as Error).message}`);
    }
};

main
/**
 * METHOD: ADVERSARIAL LOOP (8.3)
 * Steelman -> Red-Team -> Formalize -> Countermodel -> Repair
 */
export async function runAdversarialLoop(thesis: string): Promise<AdversarialLedger> {
    const loopSchema = {
        type: Type.OBJECT,
        properties: {
            thesis: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['INITIATED', 'COMPLETED', 'FAILED'] },
            robustness_score: { type: Type.NUMBER },
            history: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        phase: { type: Type.STRING, enum: ['STEELMAN', 'RED_TEAM', 'FORMALIZE', 'COUNTERMODEL', 'REPAIR'] },
                        content: { type: Type.STRING },
                        metadata: { type: Type.OBJECT }
                    },
                    required: ['phase', 'content']
                }
            }
        },
        required: ['thesis', 'status', 'history', 'robustness_score']
    };

    const prompt = `[WORKFLOW_EXECUTION] INITIATE ADVERSARIAL_LOOP.
    THESIS: "${thesis}"
    
    EXECUTION STEPS:
    1. Steelman: Construct the strongest version of the thesis.
    2. Red-Team: Generate lethal objections.
    3. Formalize: Translate to Logic (FOL/Modal).
    4. Countermodel: Find a scenario where premises hold but conclusion fails.
    5. Repair: Propose minimal delta to fix the thesis.
    
    OUTPUT: structured JSON ledger.`;

    const response = await getAI().models.generateContent({
        model: MODEL_CHAT_DEEP,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: loopSchema,
            systemInstruction: SYSTEM_INSTRUCTION
        }
    });

codex/finalize-and-enhance-entire-codebase-3aea24
    return parseStructuredResponse<AdversarialLedger>(response.text, 'adversarial loop');
=======
    return parseModelJson<AdversarialLedger>(response.text || '{}', 'adversarial loop');
main
}

/**
 * METHOD: CONCEPT AUDIT (8.1)
 * Definition discipline and equivocation detection.
 */
export async function runConceptAudit(term: string): Promise<ConceptAudit> {
    const auditSchema = {
        type: Type.OBJECT,
        properties: {
            term: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['APPROVED', 'FLAGGED'] },
            ambiguity_ratio: { type: Type.NUMBER },
            definitions: { type: Type.ARRAY, items: { type: Type.STRING } },
            canonical_definition: { type: Type.STRING }
        },
        required: ['term', 'status', 'ambiguity_ratio', 'definitions']
    };

    const prompt = `[WORKFLOW_EXECUTION] RUN CONCEPT_AUDIT.
    TERM: "${term}"
    
    TASKS:
    1. Collect uses and definitions from philosophical corpus context.
    2. Cluster senses.
    3. Calculate ambiguity ratio (0 = clear, 1 = total confusion).
    4. Define canonical version.`;

    const response = await getAI().models.generateContent({
        model: MODEL_CHAT_DEEP,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: auditSchema,
            systemInstruction: SYSTEM_INSTRUCTION
        }
    });

codex/finalize-and-enhance-entire-codebase-3aea24
    return parseStructuredResponse<ConceptAudit>(response.text, 'concept audit');
=======
    return parseModelJson<ConceptAudit>(response.text || '{}', 'concept audit');
main
}

/**
 * PHI-QL QUERY EXECUTION (9)
 * Handles WHY, TRACE, COUNTEREX, REPAIR queries.
 */
export async function runPhiQL(queryType: 'WHY' | 'TRACE' | 'COUNTEREX' | 'REPAIR', input: string): Promise<PhiQLResult> {
    // Dynamic schema based on query type would be better, but we use a generic result wrapper for now
    const phiQLSchema = {
        type: Type.OBJECT,
        properties: {
            query: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['WHY', 'TRACE', 'COUNTEREX', 'REPAIR'] },
            result: { 
                type: Type.OBJECT,
                description: "Structured result depending on query type (e.g. proof trace, counterexample list)"
            }
        },
        required: ['query', 'type', 'result']
    };

    const prompt = `[WORKFLOW_EXECUTION] EXECUTE PHI-QL QUERY.
    TYPE: ${queryType}
    INPUT: "${input}"
    
    LOGIC:
    - WHY: Return explanatory proof tree.
    - TRACE: Return historical/logical lineage.
    - COUNTEREX: Return valid countermodels.
    - REPAIR: Return minimal logical edits.
    `;

    const response = await getAI().models.generateContent({
        model: MODEL_CHAT_DEEP,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: phiQLSchema,
            systemInstruction: SYSTEM_INSTRUCTION
        }
    });

codex/finalize-and-enhance-entire-codebase-3aea24
    return parseStructuredResponse<PhiQLResult>(response.text, 'PHI-QL');
=======
    return parseModelJson<PhiQLResult>(response.text || '{}', 'PHI-QL');
main
}

/**
 * Main Entry Point for Command Processing
 */
export async function processCommand(input: string): Promise<Artifact | null> {
codex/finalize-and-enhance-entire-codebase-3aea24
    const parsedCommand = parseWorkflowCommand(input);
    if (!parsedCommand) return null;

    if (parsedCommand.command === 'ADVERSARIAL_LOOP') {
        const ledger = await runAdversarialLoop(parsedCommand.thesis);
        return { type: 'ADVERSARIAL_LEDGER', data: ledger };
    }

    if (parsedCommand.command === 'CONCEPT_AUDIT') {
        const audit = await runConceptAudit(parsedCommand.term);
        return { type: 'CONCEPT_AUDIT', data: audit };
    }

    if (parsedCommand.command === 'PHI_QL') {
        const result = await runPhiQL(parsedCommand.queryType, parsedCommand.input);
        return { type: 'PHI_QL_RESULT', data: result };
=======
    const normalizedInput = input.trim();
    if (!normalizedInput) return null;

    const normalizeExtract = (value: string): string =>
        value.trim().replace(/^["']|["']$/g, '').trim();

    // 1. Detect Adversarial Loop
    if (normalizedInput.match(/^INITIATE ADVERSARIAL_LOOP/i)) {
        const thesisMatch = normalizedInput.match(/thesis\s*[:=]\s*["'](.+?)["']/i);
        const fallback = normalizedInput.replace(/^INITIATE ADVERSARIAL_LOOP\b[:\s-]*/i, '');
        const thesis = thesisMatch ? thesisMatch[1] : normalizeExtract(fallback);
        if (!thesis) return null;
        const ledger = await runAdversarialLoop(thesis);
        return { type: 'ADVERSARIAL_LEDGER', data: ledger };
    }

    // 2. Detect Concept Audit
    if (normalizedInput.match(/^RUN CONCEPT_AUDIT/i) || normalizedInput.match(/^AUDIT TERM/i)) {
        const termMatch = normalizedInput.match(/term\s*[:=]\s*["'](.+?)["']/i);
        const fallback = normalizedInput
            .replace(/^RUN CONCEPT_AUDIT\b[:\s-]*/i, '')
            .replace(/^AUDIT TERM\b[:\s-]*/i, '');
        const term = termMatch ? termMatch[1] : normalizeExtract(fallback);
        if (!term) return null;
        const audit = await runConceptAudit(term);
        return { type: 'CONCEPT_AUDIT', data: audit };
    }

    // 3. Detect Phi-QL
    if (normalizedInput.match(/^PHI-QL(?:\s+QUERY)?/i)) {
        const typeMatch = normalizedInput.match(/\b(WHY|TRACE|COUNTEREX|REPAIR)\b/i);
        if (typeMatch) {
            const type = typeMatch[1].toUpperCase() as PhiQLResult['type'];
            const contentMatch =
                normalizedInput.match(/\(["'](.+?)["']\)/) ||
                normalizedInput.match(/[:=]\s*["']?(.+?)["']?$/);
            const content = normalizeExtract(contentMatch?.[1] || '');
            if (!content) return null;
            const result = await runPhiQL(type, content);
            return { type: 'PHI_QL_RESULT', data: result };
        }
main
    }

    return null;
}
