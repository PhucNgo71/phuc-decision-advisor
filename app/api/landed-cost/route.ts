import { NextRequest, NextResponse } from 'next/server';
import { callMcpTool } from '../../../lib/mcp';
import type { LandedCostInput } from '../../../lib/landed-cost';

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as LandedCostInput;
    const result = await callMcpTool('costing.calculate_vietnam_landed_cost', input);

    return NextResponse.json({
      boundary: 'AI advises. Human decides.',
      calculator: 'costing.calculate_vietnam_landed_cost',
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to calculate landed cost.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
