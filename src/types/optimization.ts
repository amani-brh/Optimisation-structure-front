/**
 * Types matching the API contract:
 *   GET /api/v1/Reports/optimizations
 */

export interface SuggestedModification {
  sectionType: string;
  currentProfile: string;
  recommendedProfile: string;
  quantity: number;
  currentWeightPerPiece: number;
  recommendedWeightPerPiece: number;
  totalWeightSavings: number;
  justification: string;
}

export interface OptimizationResults {
  totalWeightSavings: number;
  estimatedCostImpact: number;
  numberOfSectionsModified: number;
  feasibilityAssessment: string;
  implementationNotes: string[];
}

export interface ParameterSuggestions {
  [key: string]: string;
}

/** Numeric status code coming from the backend */
export type OptimizationStatus = 0 | 1 | 2 | 3 | number;

export interface OptimizationReport {
  id: string;
  reportId: string;
  status: OptimizationStatus;
  createdAt: string;
  aiRecommendation: string;
  optimizationStrategy: string;
  currentWeightKg: number;
  projectedWeightKg: number;
  weightReductionPercent: number;
  designModifications: string[];
  parameterSuggestions: ParameterSuggestions;
  suggestedModifications: SuggestedModification[];
  results: OptimizationResults;
}

/** Helper: human-readable status */
export function statusLabel(s: OptimizationStatus): {
  label: string;
  className: string;
} {
  switch (s) {
    case 2:
      return { label: 'Terminé', className: 's-completed' };
    case 1:
      return { label: 'En cours', className: 's-pending' };
    case 3:
      return { label: 'Échec', className: 's-failed' };
    case 0:
      return { label: 'En attente', className: 's-pending' };
    default:
      return { label: `Statut ${s}`, className: 's-other' };
  }
}
