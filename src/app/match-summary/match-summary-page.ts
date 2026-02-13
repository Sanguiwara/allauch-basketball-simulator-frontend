import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {MatchSummaryService, MatchSummaryVm} from './match-summary.service';

@Component({
  selector: 'app-match-summary-page',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './match-summary-page.html',
  styleUrl: './match-summary-page.scss',
})
export class MatchSummaryPage implements OnInit {
  readonly teamStatsColumns: string[] = ['home', 'label', 'away'];
  readonly playerColumns: string[] = [
    'player',
    'starter',
    'points',
    'assists',
    'fgm',
    'fga',
    'twoPm',
    'twoPa',
    'tpm',
    'tpa',
    'usageShoot',
    'usageDrive',
    'usagePost',
    'playmakingContribution',
    'assistWeight',
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
