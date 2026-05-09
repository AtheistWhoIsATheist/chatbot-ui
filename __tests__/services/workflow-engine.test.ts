import { parseWorkflowCommand } from "../../services/workflowEngine"

describe("parseWorkflowCommand", () => {
  it("parses concept audit from AUDIT TERM shorthand", () => {
    const parsed = parseWorkflowCommand('AUDIT TERM "being"')

    expect(parsed).toEqual({
      command: "CONCEPT_AUDIT",
      term: "being"
    })
  })

  it("parses PHI-QL commands without QUERY keyword", () => {
    const parsed = parseWorkflowCommand('PHI-QL WHY "why this matters"')

    expect(parsed).toEqual({
      command: "PHI_QL",
      queryType: "WHY",
      input: "why this matters"
    })
  })
})
