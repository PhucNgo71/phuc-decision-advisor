import commercialRules from '../../data/commercial-rules.json';
import portfolio from '../../data/portfolio.json';
import practicalExperience from '../../data/practical-experience.json';
import { learningImports } from '../learnings';
import type { KnowledgeType } from '../types';

export type RagSource = 'learning_import' | 'commercial_rule' | 'portfolio' | 'practical_experience';

export interface RagChunk {
  id: string;
  source: RagSource;
  knowledgeType: KnowledgeType;
  text: string;
  citation: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface RagResult extends RagChunk {
  score: number;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function flattenObject(prefix: string, value: unknown): RagChunk[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenObject(`${prefix}.${index}`, item));
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    const scalarEntries = entries.filter(([, entry]) =>
      ['string', 'number', 'boolean'].includes(typeof entry),
    );

    const ownChunk: RagChunk[] = scalarEntries.length
      ? [
          {
            id: prefix,
            source: prefix.startsWith('commercial')
              ? 'commercial_rule'
              : prefix.startsWith('portfolio')
                ? 'portfolio'
                : 'practical_experience',
            knowledgeType: prefix.startsWith('commercial.hard_rules') ? 'hard_rule' : 'fact',
            text: scalarEntries.map(([key, entry]) => `${key}: ${String(entry)}`).join(' | '),
            citation: prefix,
          },
        ]
      : [];

    return ownChunk.concat(
      entries.flatMap(([key, entry]) =>
        entry && typeof entry === 'object' ? flattenObject(`${prefix}.${key}`, entry) : [],
      ),
    );
  }

  return [];
}

export function buildKnowledgeIndex(): RagChunk[] {
  const imported: RagChunk[] = learningImports.flatMap((learningImport) =>
    learningImport.records.map((record) => ({
      id: record.id,
      source: 'learning_import' as const,
      knowledgeType: record.knowledgeType,
      text: record.statement,
      citation: `${learningImport.sourceTitle} — ${record.id}`,
      metadata: {
        reviewStatus: learningImport.reviewStatus,
        domain: record.domain,
        adviceImpact: record.adviceImpact,
      },
    })),
  );

  return [
    ...imported,
    ...flattenObject('commercial', commercialRules),
    ...flattenObject('portfolio', portfolio),
    ...flattenObject('practical_experience', practicalExperience),
  ];
}

const knowledgeIndex = buildKnowledgeIndex();

export function retrieveKnowledge(query: string, limit = 8): RagResult[] {
  const queryTokens = new Set(tokenize(query));
  if (!queryTokens.size) return [];

  return knowledgeIndex
    .map((chunk) => {
      const chunkTokens = tokenize(`${chunk.text} ${chunk.citation}`);
      const overlap = chunkTokens.filter((token) => queryTokens.has(token)).length;
      const hardRuleBoost = chunk.knowledgeType === 'hard_rule' ? 0.25 : 0;
      const reviewedBoost = chunk.metadata?.reviewStatus === 'reviewed' ? 0.15 : 0;
      const score = overlap / Math.max(queryTokens.size, 1) + hardRuleBoost + reviewedBoost;
      return { ...chunk, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function buildRagContext(query: string, limit = 8): string {
  const results = retrieveKnowledge(query, limit);
  if (!results.length) return 'No grounded internal knowledge was retrieved.';

  return results
    .map(
      (result, index) =>
        `[${index + 1}] ${result.knowledgeType.toUpperCase()} | ${result.text}\nSource: ${result.citation}`,
    )
    .join('\n\n');
}
