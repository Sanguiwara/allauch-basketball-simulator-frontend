import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {MatchSummaryService, MatchSummaryVm} from './match-summary.service';
import {PlayerProgressionTableComponent} from '../training/player-progression-table/player-progression-table.component';

@Component({
  selector: 'app-match-summary-page',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatTabsModule, PlayerProgressionTableComponent, RouterLink],
  templateUrl: './match-summary-page.html',
  styleUrl: './match-summary-page.scss',
})
export class MatchSummaryPage implements OnInit {
  readonly teamStatsColumns: string[] = ['home', 'label', 'away'];
  readonly playerColumns: string[] = [
    'player',
    'starter',
    'minutesPlayed',
    'points',
    'assists',
    'offensiveRebounds',
    'defensiveRebounds',
    'steals',
    'blocks',
    'fgm',
    'fga',
    'twoPm',
    'twoPa',
    'driveAttempts',
    'driveMade',
    'tpm',
    'tpa',
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
}
