import {Component, inject} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {PlayersService} from '../players.service';
import {Player} from '../../models/player.model';
import {catchError, distinctUntilChanged, map, of, shareReplay, switchMap} from 'rxjs';

import {MatCardModule} from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {AsyncPipe} from '@angular/common';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {Badge} from '../../models/badge.model';
import {BADGE_ICON_BY_NAME, DEFAULT_BADGE_ICON} from '../../utils/badge-icons';
import {BADGE_DESCRIPTION_BY_NAME, DEFAULT_BADGE_DESCRIPTION} from '../../utils/badge-descriptions';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [RouterModule, MatCardModule, MatProgressBarModule, MatButtonModule, MatIconModule, AsyncPipe, MatTab, MatTabGroup, MatProgressSpinner, MatTooltipModule],
  templateUrl: './player-detail.html',
  styleUrls: ['./player-detail.scss'],
})
export class PlayerDetail {
  private route = inject(ActivatedRoute);
  private playersService = inject(PlayersService);

  // Observable du player chargé depuis /players/:id
  player$ = this.route.params.pipe(
    map(params => params['id'] as string),
    distinctUntilChanged(),
    switchMap(id => this.playersService.getPlayerById(id).pipe(
      catchError(() => of(null))
    )),
    shareReplay(1)
  );

  // Petites listes pour afficher des “stats” de manière groupée
  offense(player: Player) {
    return [
      {label: '3 pts', value: player.tir3Pts},
      {label: '2 pts', value: player.tir2Pts},
      {label: 'Lancer franc', value: player.lancerFranc},
      {label: 'Floater', value: player.floater},
      {label: 'Finition au cercle', value: player.finitionAuCercle},
      {label: 'Ballhandling', value: player.ballhandling},
      {label: 'Passing', value: player.passingSkills},
    ];
  }

  defense(player: Player) {
    return [
      {label: 'Déf. extérieur', value: player.defExterieur},
      {label: 'Déf. poste', value: player.defPoste},
      {label: 'Protection cercle', value: player.protectionCercle},
      {label: 'Timing rebond', value: player.timingRebond},
      {label: 'Agressivité rebond', value: player.agressiviteRebond},
      {label: 'Steal', value: player.steal},
    ];
  }

  physique(player: Player) {
    return [
      {label: 'Physique', value: player.physique},
      {label: 'Endurance', value: player.endurance},
      {label: 'Solidité', value: player.solidite},
      {label: 'Speed', value: player.speed},
      {label: 'Size', value: player.size},
      {label: 'Weight', value: player.weight},
    ];
  }

  mental(player: Player) {
    return [
      {label: 'IQ (global)', value: player.iq},
      {label: 'IQ Off', value: player.basketballIqOff},
      {label: 'IQ Def', value: player.basketballIqDef},
      {label: 'Coachability', value: player.coachability},
      {label: 'Soft skills', value: player.softSkills},
      {label: 'Leadership', value: player.leadership},
      {label: 'Ego', value: player.ego},
    ];
  }

  potentiel(player: Player) {
    return [
      {label: 'Potentiel skill', value: player.potentielSkill},
      {label: 'Potentiel physique', value: player.potentielPhysique},
    ];
  }

  clamp(v: number): number {
    return Math.max(0, Math.min(100, v));
  }

  avg(values: number[]): number {
    if (!values.length) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  }

  attackScore(p: Player): number {
    return this.avg([
      p.tir3Pts, p.tir2Pts, p.lancerFranc, p.floater, p.finitionAuCercle,
      p.ballhandling, p.passingSkills
    ]);
  }

  defenseScore(p: Player): number {
    return this.avg([
      p.defExterieur, p.defPoste, p.protectionCercle, p.timingRebond, p.agressiviteRebond, p.steal
    ]);
  }

  mentalScore(p: Player): number {
    const egoScore = 100 - p.ego;
    return this.avg([
      p.iq, p.basketballIqOff, p.basketballIqDef,
      p.leadership, p.coachability, p.softSkills, egoScore
    ]);
  }

  overall(p: Player): number {
    const a = this.attackScore(p);
    const d = this.defenseScore(p);
    const m = this.mentalScore(p);
    const phys = this.avg([p.physique, p.endurance, p.solidite, p.speed]);

    return Math.round(a * 0.25 + d * 0.30 + m * 0.25 + phys * 0.20);
  }


  trackByLabel = (_: number, item: { label: string; value: number }) => item.label;

  trackByBadgeId = (_: number, badge: Badge) => badge.id;

  badgeIcon(name: string): string {
    return BADGE_ICON_BY_NAME[name] ?? DEFAULT_BADGE_ICON;
  }

  badgeDescription(name: string): string {
    return BADGE_DESCRIPTION_BY_NAME[name] ?? DEFAULT_BADGE_DESCRIPTION;
  }
}

