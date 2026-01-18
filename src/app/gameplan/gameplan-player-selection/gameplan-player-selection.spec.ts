import { ComponentFixture, TestBed } from '@angular/core/testing';
import {GameplanPlayerSelectionComponent} from './gameplan-player-selection';


describe('GameplanPlayerSelection', () => {
  let component: GameplanPlayerSelectionComponent;
  let fixture: ComponentFixture<GameplanPlayerSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameplanPlayerSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameplanPlayerSelectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
