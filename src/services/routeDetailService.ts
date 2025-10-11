import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '$lib/firebase.client';
import type { RouteDetailModel } from '../models/RouteModel';

/**
 * route-detail 생성
 */
export async function createRouteDetail(routeId: string, detail: RouteDetailModel): Promise<void> {
  await setDoc(doc(db, 'route-detail', routeId), {
    points: detail.points || [],
    split: detail.split || [],
    paths: detail.paths || [],
    links: detail.links || [],
  });
}

/**
 * route-detail 조회
 */
export async function getRouteDetail(routeId: string): Promise<RouteDetailModel | null> {
  const docRef = doc(db, 'route-detail', routeId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as RouteDetailModel;
  }
  return null;
}

/**
 * route-detail 업데이트
 */
export async function updateRouteDetail(routeId: string, detail: Partial<RouteDetailModel>): Promise<void> {
  const updateData: any = {};

  if (detail.points !== undefined) {
    updateData.points = detail.points;
  }
  if (detail.split !== undefined) {
    updateData.split = detail.split;
  }
  if (detail.paths !== undefined) {
    updateData.paths = detail.paths;
  }
  if (detail.links !== undefined) {
    updateData.links = detail.links;
  }

  if (Object.keys(updateData).length > 0) {
    await setDoc(doc(db, 'route-detail', routeId), updateData, { merge: true });
  }
}

/**
 * route-detail 삭제
 */
export async function deleteRouteDetail(routeId: string): Promise<void> {
  await deleteDoc(doc(db, 'route-detail', routeId));
}

