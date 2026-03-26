import {Badge} from '../models/badge.model';
import {
  badgeHasParentheses,
  filterBadgesWithParentheses,
  filterBadgesWithoutParentheses,
  filterBadgeNamesWithoutParentheses,
} from './badge-name';

describe('badge-name utils', () => {
  it('detects names with parentheses', () => {
    expect(badgeHasParentheses('Shooter (3PT)')).toBeTrue();
    expect(badgeHasParentheses('NoParen')).toBeFalse();
    expect(badgeHasParentheses('Half)')).toBeTrue();
    expect(badgeHasParentheses('(Start')).toBeTrue();
  });

  it('filters badge objects by parentheses', () => {
    const badges: Badge[] = [
      {id: 1, name: 'Leader', types: []},
      {id: 2, name: 'Shooter (3PT)', types: []},
      {id: 3, name: 'Playmaker', types: []},
      {id: 4, name: '(Specialist)', types: []},
    ];

    expect(filterBadgesWithParentheses(badges).map(badge => badge.name)).toEqual(['Shooter (3PT)', '(Specialist)']);
    expect(filterBadgesWithoutParentheses(badges).map(badge => badge.name)).toEqual(['Leader', 'Playmaker']);
  });

  it('filters badge names by parentheses', () => {
    const names = ['Leader', 'Shooter (3PT)', 'Clutch', 'Rebounder (Off)'];
    expect(filterBadgeNamesWithoutParentheses(names)).toEqual(['Leader', 'Clutch']);
  });
});
