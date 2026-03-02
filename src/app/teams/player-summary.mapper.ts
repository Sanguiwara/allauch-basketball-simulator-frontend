import {Injectable} from '@angular/core';
import {Badge} from '../models/badge.model';
import {PlayerDTO} from './teams.api';
import {PlayerSummaryVM} from './teams.view-models';

@Injectable({ providedIn: 'root' })
export class PlayerSummaryMapper {
  toSummary(player: PlayerDTO): PlayerSummaryVM {
    const attack = this.attackScore(player);
    const defense = this.defenseScore(player);
    const morale = this.mentalScore(player);
    const overall = this.overallScore(attack, defense, morale, player);

    return {
      id: player.id,
      name: player.name,
      attack,
      defense,
      overall,
      morale,
      badges: this.badgeLabels(player.badges),
    };
  }

  private avg(values: number[]): number {
    if (!values.length) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  }

  private attackScore(p: PlayerDTO): number {
    return this.avg([
      p.tir3Pts,
      p.tir2Pts,
      p.lancerFranc,
      p.floater,
      p.finitionAuCercle,
      p.ballhandling,
      p.passingSkills,
    ]);
  }

  private defenseScore(p: PlayerDTO): number {
    return this.avg([
      p.defExterieur,
      p.defPoste,
      p.protectionCercle,
      p.timingRebond,
      p.agressiviteRebond,
      p.steal,
    ]);
  }

  private mentalScore(p: PlayerDTO): number {
    const egoScore = 100 - p.ego;
    return this.avg([
      p.iq,
      p.basketballIqOff,
      p.basketballIqDef,
      p.leadership,
      p.coachability,
      p.softSkills,
      egoScore,
    ]);
  }

  private overallScore(attack: number, defense: number, morale: number, p: PlayerDTO): number {
    const phys = this.avg([p.physique, p.endurance, p.solidite, p.speed]);
    return Math.round(attack * 0.25 + defense * 0.30 + morale * 0.25 + phys * 0.20);
  }

  private badgeLabels(badges: Badge[] | null | undefined): string[] {
    if (!badges || !badges.length) return [];

    return badges.map(badge => {
      const name = (badge.name ?? '').trim();
      if (name) return name;
      if (badge.id !== null && badge.id !== undefined) return `Badge ${badge.id}`;
      return 'Badge';
    });
  }
}
