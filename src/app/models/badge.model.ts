import {BadgeType} from './badge-type.enum';

export interface Badge {
  id: number;
  name: string;
  types: BadgeType[];
}
