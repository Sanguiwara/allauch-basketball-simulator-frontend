import {Badge} from './badge.model';

export interface PlayerProgression {
  playerId: string;
  eventId: string;
  tir3Pts: number;
  tir2Pts: number;
  lancerFranc: number;
  floater: number;
  finitionAuCercle: number;
  speed: number;
  ballhandling: number;
  size: number;
  weight: number;
  agressivite: number;
  defExterieur: number;
  defPoste: number;
  protectionCercle: number;
  timingRebond: number;
  agressiviteRebond: number;
  steal: number;
  timingBlock: number;
  physique: number;
  basketballIqOff: number;
  basketballIqDef: number;
  passingSkills: number;
  iq: number;
  endurance: number;
  solidite: number;
  potentielSkill: number;
  potentielPhysique: number;
  coachability: number;
  ego: number;
  softSkills: number;
  leadership: number;
  morale: number;

  badges: Badge[];
}
