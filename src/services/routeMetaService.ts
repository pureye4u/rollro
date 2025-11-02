import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '$lib/firebase.client';
import type { RouteMetaModel } from '../models/RouteModel';

/**
 * route-meta 생성
 */
export async function createRouteMeta(routeId: string, meta: RouteMetaModel): Promise<void> {
  const metaData: RouteMetaModel = {
    id: routeId,
    title: meta.title || '',
    author: meta.author || '',
    owner: meta.owner || '',
    editors: meta.editors || [],
    viewers: meta.viewers || [],
    isPublic: meta.isPublic || false,
    createdAt: meta.createdAt,
    year: meta.year,
    executedDate: meta.executedDate,
    pointsCount: meta.pointsCount || 0,
  };

  await setDoc(doc(db, 'route-meta', routeId), metaData);
}

/**
 * route-meta 조회
 */
export async function getRouteMeta(routeId: string): Promise<RouteMetaModel | null> {
  const docRef = doc(db, 'route-meta', routeId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as RouteMetaModel;
  }
  return null;
}

/**
 * route-meta 업데이트
 */
export async function updateRouteMeta(routeId: string, meta: Partial<RouteMetaModel>): Promise<void> {
  const updateData: Partial<RouteMetaModel> = {};

  if (meta.title !== undefined) {
    updateData.title = meta.title;
  }
  if (meta.author !== undefined) {
    updateData.author = meta.author;
  }
  if (meta.owner !== undefined) {
    updateData.owner = meta.owner;
  }
  if (meta.editors !== undefined) {
    updateData.editors = meta.editors;
  }
  if (meta.viewers !== undefined) {
    updateData.viewers = meta.viewers;
  }
  if (meta.isPublic !== undefined) {
    updateData.isPublic = meta.isPublic;
  }
  if (meta.year !== undefined) {
    updateData.year = meta.year;
  }
  if (meta.executedDate !== undefined) {
    updateData.executedDate = meta.executedDate;
  }
  if (meta.pointsCount !== undefined) {
    updateData.pointsCount = meta.pointsCount;
  }

  if (Object.keys(updateData).length > 0) {
    await setDoc(doc(db, 'route-meta', routeId), updateData, { merge: true });
  }
}

/**
 * route-meta 삭제
 */
export async function deleteRouteMeta(routeId: string): Promise<void> {
  await deleteDoc(doc(db, 'route-meta', routeId));
}

