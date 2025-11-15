<NavBarContainer>
  <div class="user-page-container">
    {#if isLoading}
      <div class="loading">
        <div class="spinner"></div>
      </div>
    {:else}
      <div class="profile-header">
        <h1 class="nickname">{displayNickname}</h1>
        {#if isOwnProfile}
          <span class="profile-badge">내 프로필</span>
        {/if}
      </div>

      {#if visibleRoutes.length > 0}
        <div class="route-list-content">
          <List class="route-list" dense>
            {#each visibleRoutes as route (route.id)}
              <Item on:SMUI:action={() => goto(`/route/${route.id}`)}>
                <Text>
                  <div class="route-item">
                    <div class="route-header">
                      <div class="title-section">
                        <div class="title-text">
                          {route.title || '제목 없음'}
                        </div>
                        {#if route.executedDate}
                          <div class="executed-date">
                            실행 날짜: {formatExecutedDate(route.executedDate)}
                          </div>
                        {/if}
                      </div>
                      <div class="route-meta">
                        {#if route.owner === currentUserId}
                          <span class="badge owner">소유자</span>
                        {:else if route.editors && route.editors.includes(currentUserId ?? '')}
                          <span class="badge editor">편집 가능</span>
                        {:else if route.viewers && route.viewers.includes(currentUserId ?? '')}
                          <span class="badge viewer">보기 전용</span>
                        {:else if route.isPublic}
                          <span class="badge public">공개</span>
                        {/if}
                        <span class="point-count">{route.pointsCount || 0}개 지점</span>
                      </div>
                    </div>
                  </div>
                </Text>
              </Item>
            {/each}
          </List>
        </div>
      {:else}
        <div class="empty-state">
          <p>표시할 여정이 없습니다.</p>
        </div>
      {/if}
    {/if}
  </div>
</NavBarContainer>

<script lang="ts">
import { onMount } from 'svelte';
import { get } from 'svelte/store';
import { page } from '$app/stores';
import { goto } from '$app/navigation';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import List, { Item, Text } from '@smui/list';

import NavBarContainer from '../../../components/NavBarContainer.svelte';
import { db } from '$lib/firebase.client';
import type { RouteMetaModel } from '../../../models/RouteModel';
import { canView } from '../../../services/routeService';

export let data;

let isLoading = true;
let targetUserId: string | null = null;
let currentUserId: string | null = null;
let displayNickname = '알 수 없음';
let visibleRoutes: RouteMetaModel[] = [];

const FALLBACK_NICKNAME = '알 수 없음';

$: isOwnProfile = !!currentUserId && currentUserId === targetUserId;

onMount(async () => {
  targetUserId = get(page)?.params?.id ?? null;

  if (!targetUserId) {
    isLoading = false;
    return;
  }

  const user: any = await data?.getAuthUser?.();
  currentUserId = user?.uid ?? null;

  await Promise.all([
    loadNickname(targetUserId),
    loadRoutes(targetUserId, currentUserId)
  ]);

  isLoading = false;
});

async function loadNickname(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, 'user', userId));
    if (userDoc.exists()) {
      const nickname = userDoc.data()?.nickname;
      displayNickname = nickname || FALLBACK_NICKNAME;
    } else {
      displayNickname = FALLBACK_NICKNAME;
    }
  } catch (error) {
    console.error(`Error fetching nickname for ${userId}:`, error);
    displayNickname = FALLBACK_NICKNAME;
  }
}

async function loadRoutes(ownerId: string, viewerId: string | null) {
  try {
    const routeRef = collection(db, 'route-meta');
    const routeQuery = query(routeRef, where('owner', '==', ownerId));
    const snapshot = await getDocs(routeQuery);

    const fetchedRoutes = snapshot.docs
      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as RouteMetaModel))
      .filter((route) => canView(route, viewerId ?? undefined))
      .sort((a, b) => {
        const titleA = a.title || '';
        const titleB = b.title || '';
        return titleA.localeCompare(titleB);
      });

    visibleRoutes = fetchedRoutes;
  } catch (error) {
    console.error(`Error fetching routes for ${ownerId}:`, error);
    visibleRoutes = [];
  }
}

function formatExecutedDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch (error) {
    return dateString;
  }
}
</script>

<style>
.user-page-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
  padding: 16px;
  box-sizing: border-box;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.nickname {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.profile-badge {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 12px;
  background-color: #6200ee;
  color: #fff;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 200px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6200ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.route-list-content {
  flex: 1 1 auto;
  overflow-y: auto;
  margin-bottom: 80px;
  min-height: 200px;
}

:global(.route-list-content .mdc-deprecated-list) {
  padding: 0;
}

:global(.route-list-content .mdc-deprecated-list-item) {
  height: auto;
  min-height: 56px;
  padding: 0;
}

.route-item {
  width: 100%;
  display: block;
}

:global(.route-list .mdc-deprecated-list-item__text) {
  width: 100%;
}

.route-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.title-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.title-text {
  font-weight: 500;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.executed-date {
  font-size: 12px;
  line-height: 1.25;
  color: #666;
}

.route-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.badge.owner {
  background-color: #ffe8e0;
  color: #ff3e00;
}

.badge.editor {
  background-color: #f0f0f1;
  color: #676778;
}

.badge.viewer {
  background-color: #f8f8f8;
  color: #999;
}

.badge.public {
  background-color: #fafafa;
  color: #bbb;
}

.point-count {
  color: #999;
  font-size: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.empty-state p {
  margin-top: 16px;
  font-size: 16px;
}
</style>

