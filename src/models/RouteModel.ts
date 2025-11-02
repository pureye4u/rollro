// route-detail: 순수 지도 데이터만
export interface RouteDetailModel {
  id?: string;
  points: Point[];
  split: number[];
  paths: Point[];
  links: string[];
}

// route-meta: 메타데이터만
export interface RouteMetaModel {
  id?: string;
  title: string;
  author?: string;
  owner?: string;
  editors?: string[];
  viewers?: string[];
  isPublic?: boolean;
  createdAt?: any;
  year?: number;
  executedDate?: string; // 실행 날짜 (ISO 8601 형식: YYYY-MM-DD)
  pointsCount?: number;
}

// 전체 route (클라이언트에서 조합용)
export interface RouteModel extends RouteMetaModel {
  points: Point[];
  split: number[];
  paths: Point[];
  links: string[];
}

export enum RoutePermission {
  NONE = 'none',
  VIEW = 'view',
  EDIT = 'edit',
  OWNER = 'owner',
}

export interface Point {
  title?: string;
  lat: number;
  lng: number;
}