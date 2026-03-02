import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {NextTrainingComponent} from './next-training/next-training.component';

@Component({
  selector: 'app-training-page',
  standalone: true,
  imports: [CommonModule, NextTrainingComponent],
  templateUrl: './training-page.html',
  styleUrl: './training-page.scss',
})
export class TrainingPage implements OnInit {
  teamId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.teamId =
      this.route.snapshot.paramMap.get('teamId') ??
      this.route.snapshot.queryParamMap.get('teamId');
  }
}
