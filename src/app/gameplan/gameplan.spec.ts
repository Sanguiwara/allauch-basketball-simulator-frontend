import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gameplan } from './gameplan';

describe('Gameplan', () => {
  let component: Gameplan;
  let fixture: ComponentFixture<Gameplan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gameplan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gameplan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
