import {Badge} from '../models/badge.model';

const PARENTHESIS_REGEX = /[()]/;

export const badgeHasParentheses = (name: string): boolean => PARENTHESIS_REGEX.test(name);

export const filterBadgesWithParentheses = (badges: Badge[]): Badge[] =>
  badges.filter(badge => badgeHasParentheses(badge.name));

export const filterBadgesWithoutParentheses = (badges: Badge[]): Badge[] =>
  badges.filter(badge => !badgeHasParentheses(badge.name));

export const filterBadgeNamesWithoutParentheses = (badges: string[]): string[] =>
  badges.filter(badge => !badgeHasParentheses(badge));
