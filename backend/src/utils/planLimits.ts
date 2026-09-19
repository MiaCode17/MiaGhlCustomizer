import { PlanTier } from '../models/Company';

export const LOGO_CAMPAIGN_LIMITS: Record<PlanTier, number> = {
  free: 1,
  pro: 5,
  agency: Infinity,
};

export const BUTTON_PER_SURFACE_LIMITS: Record<PlanTier, number> = {
  free: 2,
  pro: 10,
  agency: Infinity,
};

export const FLOATING_BUTTON_LIMITS: Record<PlanTier, number> = {
  free: 1,
  pro: 3,
  agency: Infinity,
};
