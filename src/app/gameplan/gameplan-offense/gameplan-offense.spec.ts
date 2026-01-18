import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplanOffense } from './gameplan-offense';

describe('GameplanOffense', () => {
  let component: GameplanOffense;
  let fixture: ComponentFixture<GameplanOffense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameplanOffense]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameplanOffense);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
