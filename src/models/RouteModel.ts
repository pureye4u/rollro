export interface RouteModel {
  id?: string;
  title: string;
  points: Point[];
}

export interface Point {
  title?: string;
  lat: number;
  lng: number;
}