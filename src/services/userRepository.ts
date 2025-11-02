import { doc, getDoc } from 'firebase/firestore';
import { db } from '$lib/firebase.client';
import { browser } from '$app/environment';

interface UserNicknameCache {
  nickname: string;
  fetchedAt: number; // timestamp in milliseconds
}

interface UserCacheStorage {
  [userId: string]: UserNicknameCache;
}

const CACHE_KEY = 'user_nicknames_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5분 (밀리초)

/**
 * 브라우저 스토리지에서 캐시 읽기
 */
function getCacheFromStorage(): UserCacheStorage {
  if (!browser) return {};
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Error reading user cache from storage:', error);
    return {};
  }
}

/**
 * 브라우저 스토리지에 캐시 저장
 */
function saveCacheToStorage(cache: UserCacheStorage): void {
  if (!browser) return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving user cache to storage:', error);
  }
}

/**
 * 캐시가 유효한지 확인 (5분 이내)
 */
function isCacheValid(cachedItem: UserNicknameCache | undefined): boolean {
  if (!cachedItem) return false;
  
  const now = Date.now();
  const age = now - cachedItem.fetchedAt;
  return age < CACHE_DURATION;
}

/**
 * Firestore에서 user의 nickname 조회
 */
async function fetchNicknameFromFirestore(userId: string): Promise<string> {
  try {
    const userDoc = await getDoc(doc(db, 'user', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.nickname || '알 수 없음';
    }
    return '알 수 없음';
  } catch (error) {
    console.error(`Error fetching nickname for ${userId}:`, error);
    return '알 수 없음';
  }
}

/**
 * 단일 user의 nickname 조회 (캐시 우선)
 */
export async function getUserNickname(userId: string): Promise<string> {
  const cache = getCacheFromStorage();
  const cached = cache[userId];
  
  // 캐시가 유효하면 반환
  if (isCacheValid(cached)) {
    return cached.nickname;
  }
  
  // 캐시가 없거나 만료된 경우 Firestore에서 조회
  const nickname = await fetchNicknameFromFirestore(userId);
  
  // 캐시 업데이트
  cache[userId] = {
    nickname,
    fetchedAt: Date.now()
  };
  saveCacheToStorage(cache);
  
  return nickname;
}

/**
 * 여러 user의 nickname을 한 번에 조회 (캐시 우선, 병렬 처리)
 */
export async function getUsersNicknames(userIds: string[]): Promise<Record<string, string>> {
  const uniqueIds = [...new Set(userIds)]; // 중복 제거
  if (uniqueIds.length === 0) return {};
  
  const cache = getCacheFromStorage();
  const result: Record<string, string> = {};
  const idsToFetch: string[] = [];
  
  // 캐시에서 유효한 항목 조회
  uniqueIds.forEach(id => {
    const cached = cache[id];
    if (isCacheValid(cached)) {
      result[id] = cached.nickname;
    } else {
      idsToFetch.push(id);
    }
  });
  
  // 캐시에 없거나 만료된 항목은 Firestore에서 조회
  if (idsToFetch.length > 0) {
    const fetchedResults = await Promise.all(
      idsToFetch.map(async (userId) => {
        const nickname = await fetchNicknameFromFirestore(userId);
        return { userId, nickname };
      })
    );
    
    // 결과 반영 및 캐시 업데이트
    fetchedResults.forEach(({ userId, nickname }) => {
      result[userId] = nickname;
      cache[userId] = {
        nickname,
        fetchedAt: Date.now()
      };
    });
    
    saveCacheToStorage(cache);
  }
  
  return result;
}

/**
 * 특정 user의 캐시를 수동으로 무효화 (선택적)
 */
export function invalidateUserCache(userId: string): void {
  if (!browser) return;
  
  const cache = getCacheFromStorage();
  delete cache[userId];
  saveCacheToStorage(cache);
}

/**
 * 모든 user 캐시를 무효화 (선택적)
 */
export function clearUserCache(): void {
  if (!browser) return;
  
  localStorage.removeItem(CACHE_KEY);
}

