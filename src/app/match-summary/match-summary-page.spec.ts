import '@angular/compiler';
import {of} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {MatchSummaryPage} from './match-summary-page';
import {MatchSummaryService} from './match-summary.service';

describe('MatchSummaryPage', () => {
  it('computes the centered gauge offset and clamps displayed values', () => {
    const component = new MatchSummaryPage(
      {
        queryParamMap: of(),
      } as unknown as ActivatedRoute,
      {} as MatchSummaryService,
    );

    expect(component.getCollectivePlayQualityOffset(25)).toBe(100);
    expect(component.getCollectivePlayQualityOffset(-25)).toBe(0);
    expect(component.getCollectivePlayQualityOffset(0)).toBe(50);
    expect(component.getCollectivePlayQualityDisplay(40)).toBe(25);
    expect(component.getCollectivePlayQualityDisplay(-40)).toBe(-25);
  });
});
