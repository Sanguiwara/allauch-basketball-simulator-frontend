import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatRadioModule} from '@angular/material/radio';

import {ZoneDefenseType} from '../../models/zone-defense-type.enum';

@Component({
  selector: 'gameplan-zone-defense',
  standalone: true,
  imports: [MatCard, MatCardContent, MatRadioModule],
  templateUrl: './gameplan-zone-defense.html',
  styleUrl: './gameplan-zone-defense.scss',
})
export class GameplanZoneDefenseComponent {
  @Input() zoneType: ZoneDefenseType | null = null;
  @Output() zoneTypeChange = new EventEmitter<ZoneDefenseType>();

  readonly zoneOptions = [
    {label: '2_1_2', value: ZoneDefenseType.TWO_ONE_TWO},
    {label: '2_3', value: ZoneDefenseType.TWO_THREE},
    {label: '3_2', value: ZoneDefenseType.THREE_TWO},
  ];

  onZoneTypeChange(value: ZoneDefenseType): void {
    this.zoneTypeChange.emit(value);
  }
}
