import { auditOntology } from "../../services/logicValidator"
import { Node } from "../../types"

const baseNode: Node = {
  id: "n1",
  type: "CONCEPT",
  val: 1,
  label: "Void concept"
}

describe("auditOntology", () => {
  it("returns null when node does not mention void-like terms", () => {
    const issue = auditOntology({
      ...baseNode,
      label: "Ordinary concept",
      description: "Neutral description"
    })

    expect(issue).toBeNull()
  })

  it("includes the exact trigger phrase when reification is detected", () => {
    const issue = auditOntology({
      ...baseNode,
      description: "The void is an object that sits in space."
    })

    expect(issue).not.toBeNull()
    expect(issue?.message).toContain("Trigger phrase: 'sits in space'")
  })
})
