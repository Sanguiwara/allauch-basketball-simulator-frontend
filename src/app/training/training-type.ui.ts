import {TrainingType} from './training.models';

export interface TrainingTypeUi {
  label: string;
  icon: string;
}

export const TRAINING_TYPE_UI: Record<TrainingType, TrainingTypeUi> = {
  SHOOTING: { label: 'Shoot', icon: 'sports_basketball' },
  DEFENSE: { label: 'Défense', icon: 'shield' },
  PHYSICAL: { label: 'Physique', icon: 'fitness_center' },
  PLAYMAKING: { label: 'Playmaking', icon: 'auto_graph' },
  MORALE: { label: 'Moral', icon: 'sentiment_satisfied' },
  TACTICAL: { label: 'Tactique', icon: 'account_tree' },
};

export const TRAINING_TYPE_FALLBACK: TrainingTypeUi = {
  label: 'Autre',
  icon: 'help',
};

export const TRAINING_TYPE_OPTIONS: TrainingType[] = [
  'SHOOTING',
  'DEFENSE',
  'PHYSICAL',
  'PLAYMAKING',
  'MORALE',
  'TACTICAL',
];

export function getTrainingTypeUi(type: TrainingType | null | undefined): TrainingTypeUi {
  if (!type) return TRAINING_TYPE_FALLBACK;
  return TRAINING_TYPE_UI[type] ?? { label: type, icon: 'help' };
}
