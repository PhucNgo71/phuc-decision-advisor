import { NextRequest, NextResponse } from 'next/server';
import { readProcurementState, writeProcurementState } from '../../../lib/procurement/repository';
import type { ProcurementRole, ProcurementState } from '../../../lib/procurement/types';

export const runtime = 'nodejs';

const roles: ProcurementRole[] = ['Owner Admin', 'Procurement', 'Evaluator', 'Vendor', 'Auditor / Compliance'];

export async function GET() {
  return NextResponse.json(readProcurementState());
}

export async function PUT(request: NextRequest) {
  try {
    const role = request.headers.get('x-procurement-role') as ProcurementRole;
    if (!roles.includes(role) || role === 'Auditor / Compliance') return NextResponse.json({ error: 'This role has read-only access.' }, { status: 403 });
    const body = await request.json() as { state: ProcurementState; revision: number };
    const revision = writeProcurementState(body.state, body.revision, role);
    return NextResponse.json({ revision });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to persist procurement state.';
    const status = message.includes('changed') || message.includes('Concurrent') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
