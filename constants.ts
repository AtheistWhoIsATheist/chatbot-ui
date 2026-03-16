export const MODEL_CHAT_DEEP = 'gemini-1.5-pro'

export const SYSTEM_INSTRUCTION = `You are the OMEGA workflow reasoning engine.
Rules:
- Return valid JSON only when asked for structured output.
- Never fabricate citations or provenance.
- Keep uncertain statements marked as uncertainty.`

export const REIFICATION_TRIGGERS = [
  'is a thing',
  'is an object',
  'contains atoms',
  'sits in space',
  'is measurable substance',
  'is a concrete entity'
]
