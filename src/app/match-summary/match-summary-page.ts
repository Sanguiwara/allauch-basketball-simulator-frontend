import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {MatchSummaryService, MatchSummaryVm} from './match-summary.service';
import {PlayerProgressionTableComponent} from '../training/player-progression-table/player-progression-table.component';
import {MatchSummaryMatchupsComponent} from './match-summary-matchups/match-summary-matchups.component';

@Component({
  selector: 'app-match-summary-page',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatTabsModule, PlayerProgressionTableComponent, RouterLink, MatchSummaryMatchupsComponent],
  templateUrl: './match-summary-page.html',
  styleUrl: './match-summary-page.scss',
})
export class MatchSummaryPage implements OnInit {
  private static readonly COLLECTIVE_PLAY_QUALITY_LIMIT = 20;

  readonly teamStatsColumns: string[] = ['home', 'label', 'away'];
  readonly playerColumns: string[] = [
    'player',
    'starter',
    'minutesPlayed',
    'playmakingContribution',
    'points',
    'assists',
    'offensiveRebounds',
    'defensiveRebounds',
    'steals',
    'blocks',
    'driveMade',
    'driveAttempts',
    'twoPm',
    'twoPa',
    'tpm',
    'tpa',
    'fgm',
    'fga',
    'usageShoot',
    'usageDrive',
    'usagePost',
  ];

  vm$!: Observable<MatchSummaryVm | null>;

  constructor(
    private route: ActivatedRoute,
    private service: MatchSummaryService,
  ) {}

  ngOnInit(): void {
    this.vm$ = this.route.queryParamMap.pipe(
      map(params => params.get('id')),
      switchMap(id => (id ? this.service.getMatchSummary(id) : of(null))),
    );
  }

  getCollectivePlayQualityOffset(value: number): number {
    const clamped = this.getCollectivePlayQualityDisplay(value);
    return ((clamped + MatchSummaryPage.COLLECTIVE_PLAY_QUALITY_LIMIT) / (MatchSummaryPage.COLLECTIVE_PLAY_QUALITY_LIMIT * 2)) * 100;
  }

  getCollectivePlayQualityDisplay(value: number): number {
    return Math.max(-MatchSummaryPage.COLLECTIVE_PLAY_QUALITY_LIMIT, Math.min(MatchSummaryPage.COLLECTIVE_PLAY_QUALITY_LIMIT, value));
  }

  getPlaymakingContribution(contributions: Record<string, number>, playerId: string): number {
    return contributions[playerId] ?? 0;
  }

  protected readonly Math = Math;
}
