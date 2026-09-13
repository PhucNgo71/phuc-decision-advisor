import { calculateVietnamLandedCost, type LandedCostInput } from '../landed-cost';

export type McpToolRisk = 'read' | 'calculate' | 'propose' | 'write';

export interface McpTool<Input = unknown, Output = unknown> {
  name: string;
  description: string;
  risk: McpToolRisk;
  requiresHumanApproval: boolean;
  execute: (input: Input) => Promise<Output> | Output;
}

const registry = new Map<string, McpTool>();

export function registerMcpTool(tool: McpTool): void {
  registry.set(tool.name, tool);
}

export function listMcpTools() {
  return Array.from(registry.values()).map(({ execute: _execute, ...tool }) => tool);
}

export async function callMcpTool<T = unknown>(
  name: string,
  input: unknown,
  options: { humanApproved?: boolean } = {},
): Promise<T> {
  const tool = registry.get(name);
  if (!tool) throw new Error(`Unknown MCP tool: ${name}`);

  if (tool.requiresHumanApproval && !options.humanApproved) {
    throw new Error(`Human approval required before calling MCP tool: ${name}`);
  }

  return (await tool.execute(input)) as T;
}

registerMcpTool({
  name: 'advisor.echo_context',
  description: 'Read-only connectivity test for the Decision Advisor MCP tool gateway.',
  risk: 'read',
  requiresHumanApproval: false,
  execute: (input) => ({ ok: true, input }),
});

registerMcpTool({
  name: 'costing.calculate_vietnam_landed_cost',
  description:
    'Deterministically estimate Vietnam landed cost from human-supplied/grounded values, freight, duty rate, VAT rate, fees and contingency. It never invents HS codes or tariff rates.',
  risk: 'calculate',
  requiresHumanApproval: false,
  execute: (input) => calculateVietnamLandedCost(input as LandedCostInput),
});

registerMcpTool({
  name: 'advisor.propose_action',
  description: 'Create a proposed action for human review. It never executes the business decision itself.',
  risk: 'propose',
  requiresHumanApproval: false,
  execute: (input) => ({ status: 'proposal_only', proposal: input }),
});

registerMcpTool({
  name: 'advisor.execute_approved_action',
  description:
    'Reserved write boundary. It can only be used after explicit human approval and should be connected to a narrowly scoped adapter.',
  risk: 'write',
  requiresHumanApproval: true,
  execute: () => ({ status: 'not_configured', message: 'No write adapter is configured.' }),
});
