import {TrainingDTO} from './training.models';

const MOCK_TEAM = {
  id: 'team-mock-1',
  name: 'Allauch',
  ageCategory: 'SENIOR',
  gender: 'M',
  players: [],
};

const MOCK_TRAININGS: TrainingDTO[] = [
  {
    id: 'training-mock-1',
    executeAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    trainingType: 'DEFENSE',
    team: MOCK_TEAM,
    playerProgressions: [],
  },
  {
    id: 'training-mock-2',
    executeAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    trainingType: 'SHOOTING',
    team: MOCK_TEAM,
    playerProgressions: [],
  },
  {
    id: 'training-mock-3',
    executeAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    trainingType: 'PHYSICAL',
    team: MOCK_TEAM,
    playerProgressions: [],
  },
];

export function getMockTrainings(): TrainingDTO[] {
  return MOCK_TRAININGS.map((training) => ({...training}));
}

export function getMockTrainingById(id: string): TrainingDTO | null {
  const found = MOCK_TRAININGS.find((training) => training.id === id);
  return found ? {...found} : null;
}
