import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { PlayerDetail } from './player-detail';

describe('PlayerDetail', () => {
  let component: PlayerDetail;
  let fixture: ComponentFixture<PlayerDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerDetail, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('goBack navigates to history when available', () => {
    const location = TestBed.inject(Location);
    const router = TestBed.inject(Router);
    const locationSpy = spyOn(location, 'back');
    const routerSpy = spyOn(router, 'navigate');
    spyOn(component as unknown as { hasHistory: () => boolean }, 'hasHistory').and.returnValue(true);

    component.goBack();

    expect(locationSpy).toHaveBeenCalled();
    expect(routerSpy).not.toHaveBeenCalled();
  });

  it('goBack falls back to players list when history is empty', () => {
    const location = TestBed.inject(Location);
    const router = TestBed.inject(Router);
    const locationSpy = spyOn(location, 'back');
    const routerSpy = spyOn(router, 'navigate');
    spyOn(component as unknown as { hasHistory: () => boolean }, 'hasHistory').and.returnValue(false);

    component.goBack();

    expect(locationSpy).not.toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/players']);
  });
});
