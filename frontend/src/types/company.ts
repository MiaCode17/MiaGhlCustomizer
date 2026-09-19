export type PlanTier = 'free' | 'pro' | 'agency';

export interface Company {
  id: string;
  name: string;
  plan: PlanTier;
}
