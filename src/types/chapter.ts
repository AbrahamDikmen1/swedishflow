import { Mission } from './mission';

export interface Chapter {
  id: string;
  order: number;
  title: string;
  description: string;
  missions: Mission[];
}
