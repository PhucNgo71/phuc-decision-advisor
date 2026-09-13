import { NextRequest, NextResponse } from 'next/server';
import { buildRagContext, retrieveKnowledge } from '../../../lib/rag';
import { listMcpTools } from '../../../lib/mcp';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  return NextResponse.json({
    boundary: 'AI advises. Human decides.',
    query,
    rag: query
      ? {
          results: retrieveKnowledge(query),
          context: buildRagContext(query),
        }
      : {
          results: [],
          context: 'Pass ?q=<decision question> to retrieve grounded internal knowledge.',
        },
    mcp: {
      tools: listMcpTools(),
      policy: 'Read/calculate/propose tools may assist analysis. Write tools require explicit human approval.',
    },
  });
}
