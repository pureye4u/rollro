import type { RouteModel, RouteMetaModel } from '../models/RouteModel';
import { RoutePermission } from '../models/RouteModel';

/**
 * 사용자가 여정을 볼 수 있는지 확인
 */
export function canView(route: RouteModel | RouteMetaModel, userId?: string): boolean {
  // 공개 여정은 누구나 볼 수 있음
  if (route.isPublic) {
    return true;
  }

  // 로그인하지 않았다면 공개 여정만 볼 수 있음
  if (!userId) {
    return false;
  }

  // owner, editor, viewer 중 하나라면 볼 수 있음
  if (route.owner === userId) {
    return true;
  }

  if (route.editors && route.editors.includes(userId)) {
    return true;
  }

  if (route.viewers && route.viewers.includes(userId)) {
    return true;
  }

  return false;
}

/**
 * 사용자가 여정을 수정할 수 있는지 확인
 */
export function canEdit(route: RouteModel, userId?: string): boolean {
  if (!userId) {
    return false;
  }

  // owner 또는 editor만 수정 가능
  if (route.owner === userId) {
    return true;
  }

  if (route.editors && route.editors.includes(userId)) {
    return true;
  }

  return false;
}

/**
 * 사용자가 여정을 삭제할 수 있는지 확인
 */
export function canDelete(route: RouteModel, userId?: string): boolean {
  if (!userId) {
    return false;
  }

  // owner만 삭제 가능
  return route.owner === userId;
}

/**
 * 사용자가 여정의 권한을 관리할 수 있는지 확인
 */
export function canManagePermissions(route: RouteModel, userId?: string): boolean {
  if (!userId) {
    return false;
  }

  // owner만 권한 관리 가능
  return route.owner === userId;
}

/**
 * 사용자의 권한 레벨을 반환
 */
export function getUserPermission(route: RouteModel | RouteMetaModel, userId?: string): RoutePermission {
  if (!userId) {
    return route.isPublic ? RoutePermission.VIEW : RoutePermission.NONE;
  }

  if (route.owner === userId) {
    return RoutePermission.OWNER;
  }

  if (route.editors && route.editors.includes(userId)) {
    return RoutePermission.EDIT;
  }

  if (route.viewers && route.viewers.includes(userId)) {
    return RoutePermission.VIEW;
  }

  return route.isPublic ? RoutePermission.VIEW : RoutePermission.NONE;
}

