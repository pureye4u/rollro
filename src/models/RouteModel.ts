export interface RouteModel {
  id?: string;
  title: string;
  author?: string;
  points: Point[];
  split: number[];
  paths: Point[];
  links: string[];
}

export interface Point {
  title?: string;
  lat: number;
  lng: number;
}