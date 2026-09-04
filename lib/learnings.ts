import imports from '../data/learning-imports.json';
import type { LearningImport } from './types';

export const learningImports = imports as LearningImport[];

export const reviewedLearningCount = learningImports
  .filter((learningImport) => learningImport.reviewStatus === 'reviewed')
  .flatMap((learningImport) => learningImport.records)
  .filter((record) => record.adviceImpact !== 'none').length;

export const latestLearningImport = learningImports.at(-1);

