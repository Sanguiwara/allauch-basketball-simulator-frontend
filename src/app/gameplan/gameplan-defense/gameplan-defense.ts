import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';

import {GamePlan} from '../../models/gameplan.model';
import {DefenseType} from '../../models/zone.enum';
import {ZoneDefenseType} from '../../models/zone-defense-type.enum';
import {GamePlanApiService} from '../gameplan-service';
import {GameplanMatchupComponent} from '../gameplan-matchups/gameplan-matchup';
import {GameplanZoneDefenseComponent} from '../gameplan-zone-defense/gameplan-zone-defense';

type DefenseFamily = 'MAN_TO_MAN' | 'ZONE';

@Component({
  selector: 'gameplan-defense',
  standalone: true,
  imports: [MatRadioModule, MatButtonModule, GameplanZoneDefenseComponent, GameplanMatchupComponent],
  templateUrl: './gameplan-defense.html',
  styleUrl: './gameplan-defense.scss',
})
export class GameplanDefenseComponent implements OnChanges {
  @Input({required: true}) gamePlan!: GamePlan;

  defenseFamily: DefenseFamily = 'MAN_TO_MAN';
  zoneType: ZoneDefenseType | null = null;

  constructor(private api: GamePlanApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gamePlan'] && this.gamePlan) {
      this.hydrateFromPlan();
    }
  }

  get isZone(): boolean {
    return this.defenseFamily === 'ZONE';
  }

  get isZoneInvalid(): boolean {
    return this.isZone && !this.zoneType;
  }

  setDefenseFamily(value: DefenseFamily): void {
    this.defenseFamily = value;

    if (value === 'MAN_TO_MAN') {
      this.zoneType = null;
    } else if (!this.zoneType) {
      this.zoneType = this.gamePlan.zoneType ?? this.mapDefenseTypeToZoneType(this.gamePlan.defenseType);
    }

    this.applyDefenseSelection();
  }

  onZoneTypeChange(zoneType: ZoneDefenseType): void {
    this.zoneType = zoneType;
    this.applyDefenseSelection();
  }

  saveDefense(): void {
    if (!this.gamePlan || this.isZoneInvalid) return;
    this.applyDefenseSelection();
    this.api.saveGamePlan(this.gamePlan).subscribe();
  }

  private hydrateFromPlan(): void {
    if (this.isZoneDefense(this.gamePlan.defenseType)) {
      this.defenseFamily = 'ZONE';
      this.zoneType = this.gamePlan.zoneType ?? this.mapDefenseTypeToZoneType(this.gamePlan.defenseType);
    } else {
      this.defenseFamily = 'MAN_TO_MAN';
      this.zoneType = null;
    }

    this.applyDefenseSelection();
  }

  private applyDefenseSelection(): void {
    if (!this.gamePlan) return;

    if (this.defenseFamily === 'MAN_TO_MAN') {
      this.gamePlan.defenseType = DefenseType.MAN_TO_MAN;
      this.gamePlan.zoneType = null;
      return;
    }

    this.gamePlan.zoneType = this.zoneType ?? null;
    if (this.zoneType) {
      this.gamePlan.defenseType = this.mapZoneTypeToDefenseType(this.zoneType);
    }
  }

  private isZoneDefense(defenseType: DefenseType): boolean {
    return defenseType !== DefenseType.MAN_TO_MAN;
  }

  private mapDefenseTypeToZoneType(defenseType: DefenseType): ZoneDefenseType | null {
    switch (defenseType) {
      case DefenseType.ZONE_2_1_2:
        return ZoneDefenseType.TWO_ONE_TWO;
      case DefenseType.ZONE_2_3:
        return ZoneDefenseType.TWO_THREE;
      case DefenseType.ZONE_3_2:
        return ZoneDefenseType.THREE_TWO;
      default:
        return null;
    }
  }

  private mapZoneTypeToDefenseType(zoneType: ZoneDefenseType): DefenseType {
    switch (zoneType) {
      case ZoneDefenseType.TWO_ONE_TWO:
        return DefenseType.ZONE_2_1_2;
      case ZoneDefenseType.TWO_THREE:
        return DefenseType.ZONE_2_3;
      case ZoneDefenseType.THREE_TWO:
        return DefenseType.ZONE_3_2;
      default:
        return DefenseType.ZONE_2_3;
    }
  }
}
