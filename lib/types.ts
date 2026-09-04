export type WinObjective = 'must_win' | 'target_scope' | 'defensive' | 'partial_win' | 'profit_led' | 'reference_led';
export type KnowledgeType = 'fact' | 'current_preference' | 'experience' | 'judgment' | 'hard_rule' | 'temporary_context';

export interface Opportunity {
  id: string;
  customer: string;
  customerOrigin?: string;
  projectValue?: number;
  budget?: number;
  winObjectives: { scope: string; objective: WinObjective; priority: number }[];
  competitors: string[];
  relationshipNotes: string[];
  paymentTerms?: string;
  bondRequired?: boolean;
}

export interface AdvisorOutput {
  situation: string;
  winObjective: string;
  signals: string[];
  conflicts: string[];
  scenarios: { name: string; rationale: string; tradeoffs: string[] }[];
  risks: string[];
  unknowns: string[];
  recommendedDirection: string;
  whatCouldChangeAdvice: string[];
  confidence: number;
}
