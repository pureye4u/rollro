<NavBarContainer>
  <div class="route-page-container">
    <div class="search-container">
      <Textfield 
        bind:value={searchKeyword} 
        label="여정 검색" 
        on:input={handleSearch}
        style="width: 100%; margin-bottom: 10px;"
      >
        <Icon class="material-icons" slot="leadingIcon">search</Icon>
      </Textfield>
      
      <div class="filter-chips">
        <button 
          class="filter-chip" 
          class:active={selectedFilter === 'my'}
          on:click={() => toggleFilter('my')}
        >
          내 여정
        </button>
        {#each availableYears as year}
          <button 
            class="filter-chip" 
            class:active={selectedYears.includes(year)}
            on:click={() => toggleYearFilter(year)}
          >
            {year}
          </button>
        {/each}
        {#if selectedFilter === 'my' || selectedYears.length > 0}
          <button 
            class="filter-chip reset" 
            on:click={resetFilters}
          >
            <Icon class="material-icons" style="font-size: 16px;">close</Icon>
            초기화
          </button>
        {/if}
      </div>
    </div>

    <div class="route-list-content">
      {#if isLoading}
        <div class="loading">
          <div class="spinner"></div>
        </div>
      {:else if filteredRoutes.length === 0}
        <div class="empty-state">
          <Icon class="material-icons" style="font-size: 48px; color: #ccc;">route</Icon>
          <p>여정이 없습니다</p>
        </div>
      {:else}
        <List class="route-list" dense>
          {#each paginatedRoutes as route}
          <Item on:SMUI:action={() => goto(`/route/${route.id}`)}>
            <Text>
              <div class="route-item">
                <div class="route-header">
                  <div class="title-section">
                    <div class="title-text">
                      {route.title}
                    </div>
                    {#if route.executedDate}
                      <div class="executed-date">
                        실행 날짜: {formatExecutedDate(route.executedDate)}
                      </div>
                    {/if}
                  </div>
                  <div class="route-meta">
                    {#if route.owner}
                      {#if route.owner === userID}
                        <span class="owner-name owner-self">
                          {ownerNames[route.owner] || '로딩 중...'}
                        </span>
                      {:else}
                        <button
                          type="button"
                          class="owner-name clickable"
                          data-owner-id={route.owner}
                          bind:this={ownerNameButtons[route.owner]}
                          on:click|stopPropagation={(e) => {
                            if (route.owner && e.currentTarget instanceof HTMLElement) {
                              openUserMenu(route.owner, e.currentTarget);
                            }
                          }}
                          on:keypress|stopPropagation={(e) => {
                            if (route.owner && (e.key === 'Enter' || e.key === ' ') && e.currentTarget instanceof HTMLElement) {
                              e.preventDefault();
                              openUserMenu(route.owner, e.currentTarget);
                            }
                          }}
                          aria-label="사용자 메뉴 열기"
                        >
                          {ownerNames[route.owner] || '로딩 중...'}
                        </button>
                      {/if}
                    {/if}
                    {#if route.owner === userID}
                      <span class="badge owner">소유자</span>
                    {:else if route.editors && route.editors.includes(userID)}
                      <span class="badge editor">편집 가능</span>
                    {:else if route.viewers && route.viewers.includes(userID)}
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

        <!-- 사용자 메뉴 -->
        <MenuSurface 
          bind:open={userMenuOpen} 
          bind:this={userMenuSurface}
          class="user-menu-surface"
          style="right: {menuPosition.right}px; bottom: {menuPosition.bottom}px;"
        >
          <List>
            {#if selectedOwnerId && userID && selectedOwnerId !== userID}
              <Item on:SMUI:action={() => {
                if (selectedOwnerId) {
                  userMenuOpen = false;
                  goto(`/user/${selectedOwnerId}`);
                }
              }}>
                <Text>사용자 페이지</Text>
              </Item>
              <Separator />
              {#if userFollowers[selectedOwnerId]}
                <Item on:SMUI:action={() => {
                  if (selectedOwnerId) {
                    removeFollower(selectedOwnerId);
                  }
                }}>
                  <Text>팔로우 취소</Text>
                </Item>
              {:else}
                <Item on:SMUI:action={() => {
                  if (selectedOwnerId) {
                    addFollower(selectedOwnerId);
                  }
                }}>
                  <Text>팔로우 추가</Text>
                </Item>
              {/if}
            {/if}
          </List>
        </MenuSurface>

        {#if totalPages > 1}
        <div class="pagination">
          <Button 
            on:click={() => changePage(currentPage - 1)} 
            disabled={currentPage === 1}
            variant="outlined"
            class="page-nav-btn"
          >
            <Icon class="material-icons">chevron_left</Icon>
          </Button>
          
          <div class="page-numbers">
            {#each getPageNumbers() as pageNum}
              <button
                class="page-number"
                class:active={pageNum === currentPage}
                on:click={() => changePage(pageNum)}
              >
                {pageNum}
              </button>
            {/each}
          </div>
          
          <Button 
            on:click={() => changePage(currentPage + 1)} 
            disabled={currentPage === totalPages}
            variant="outlined"
            class="page-nav-btn"
          >
            <Icon class="material-icons">chevron_right</Icon>
          </Button>
        </div>
        {/if}
      {/if}
    </div>
  </div>

  <div class="floating-control">
    <Fab color="primary" on:click={addRoute} disabled={isAddDisabled}>
      <Icon class="material-icons">add</Icon>
    </Fab>
  </div>
</NavBarContainer>

<script lang="ts">
import { onMount, tick } from 'svelte';
import { collection, getDocs, addDoc, query, orderBy, where, serverTimestamp, doc, getDoc, arrayUnion, arrayRemove, updateDoc } from 'firebase/firestore';
import List, { Item, Text, Separator } from '@smui/list';
import Button from '@smui/button';
import Fab, { Label, Icon } from '@smui/fab';
import Textfield from '@smui/textfield';
import MenuSurface, { Anchor } from '@smui/menu-surface';
import { goto } from '$app/navigation';
import { db } from '$lib/firebase.client';
import { getUsersNicknames } from '../../services/userRepository';
import NavBarContainer from '../../components/NavBarContainer.svelte';
import type { RouteMetaModel } from '../../models/RouteModel';
import { canView } from '../../services/routeService';
import { createRouteMeta } from '../../services/routeMetaService';
import { createRouteDetail } from '../../services/routeDetailService';

let allRoutes: RouteMetaModel[] = [];
let filteredRoutes: RouteMetaModel[] = [];
let paginatedRoutes: RouteMetaModel[] = [];
let isAddDisabled = true;
let isLoading = true;
let userID: string;
let searchKeyword = '';
let selectedFilter: string = '';
let selectedYears: number[] = [];
let availableYears: number[] = [];
let currentPage = 1;
const itemsPerPage = 30;
let totalPages = 1;

// 소유자 정보 캐시
let ownerNames: Record<string, string> = {};

// 사용자 메뉴 관련
let userMenuSurface: MenuSurface;
let selectedOwnerId: string | null = null;
let userMenuOpen = false;
let userFollowers: Record<string, boolean> = {}; // ownerId -> isFollowing
let ownerNameButtons: Record<string, HTMLButtonElement | undefined> = {};
let menuPosition = { right: 0, bottom: 0 };

async function openUserMenu(ownerId: string, button: HTMLElement) {
  if (!userID || !ownerId || ownerId === userID) return;
  
  selectedOwnerId = ownerId;
  await checkFollowerStatus(ownerId);
  
  // 버튼 위치 계산하여 MenuSurface 위치 설정
  await tick();
  if (button) {
    const rect = button.getBoundingClientRect();
    // getBoundingClientRect()는 viewport 기준 좌표를 반환
    // bottom은 화면 하단에서 버튼 상단까지의 거리
    // left는 버튼의 왼쪽 위치
    const right = window.innerWidth - rect.right;
    const bottom = window.innerHeight - rect.top;
    
    console.log('Button rect:', rect);
    console.log('Calculated CSS position:', { right, bottom });
    
    // CSS 변수로 위치 설정
    menuPosition = { right, bottom };
    
    // 메뉴 열기
    userMenuOpen = true;
  }
}

async function loadRouteList() {
  isLoading = true;
  try {
    // route-meta 컬렉션에서 가벼운 메타데이터만 조회
    const ref = collection(db, 'route-meta');
    const q = query(ref, orderBy('title'));
    const snapshot = await getDocs(q);
    
    // 모든 여정을 가져온 후 권한에 따라 필터링
    allRoutes = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as RouteMetaModel))
      .filter(route => canView(route, userID));
    
    // 소유자 정보 로드
    await loadOwnerNames();
    
    extractAvailableYears();
    applyFilters();
  } catch (error) {
    console.error('Error loading routes:', error);
  } finally {
    isLoading = false;
  }
}

async function loadOwnerNames() {
  const ownerIds = new Set<string>();
  allRoutes.forEach(route => {
    if (route.owner) {
      ownerIds.add(route.owner);
    }
  });
  
  const uniqueOwnerIds = Array.from(ownerIds);
  if (uniqueOwnerIds.length === 0) return;
  
  // 리포지터리 패턴을 사용하여 nickname 조회 (캐시 포함, 5분 유지)
  const nicknames = await getUsersNicknames(uniqueOwnerIds);
  
  // 결과를 ownerNames에 반영
  uniqueOwnerIds.forEach(ownerId => {
    ownerNames[ownerId] = nicknames[ownerId] || '알 수 없음';
  });
}

/**
 * 특정 사용자가 현재 사용자를 follower로 가지고 있는지 확인
 */
async function checkFollowerStatus(ownerId: string): Promise<void> {
  if (!userID || !ownerId || ownerId === userID) {
    userFollowers[ownerId] = false;
    return;
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'user', ownerId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const followers = userData.followers || [];
      userFollowers[ownerId] = Array.isArray(followers) && followers.includes(userID);
    } else {
      userFollowers[ownerId] = false;
    }
  } catch (error) {
    console.error(`Error checking follower status for ${ownerId}:`, error);
    userFollowers[ownerId] = false;
  }
}

/**
 * 사용자를 follower로 추가
 */
async function addFollower(ownerId: string) {
  if (!userID || !ownerId || ownerId === userID) return;
  
  try {
    const userRef = doc(db, 'user', ownerId);
    await updateDoc(userRef, {
      followers: arrayUnion(userID)
    });
    userFollowers[ownerId] = true;
    userMenuOpen = false;
  } catch (error) {
    console.error(`Error adding follower for ${ownerId}:`, error);
  }
}

/**
 * follower 제거
 */
async function removeFollower(ownerId: string) {
  if (!userID || !ownerId || ownerId === userID) return;
  
  try {
    const userRef = doc(db, 'user', ownerId);
    await updateDoc(userRef, {
      followers: arrayRemove(userID)
    });
    userFollowers[ownerId] = false;
    userMenuOpen = false;
  } catch (error) {
    console.error(`Error removing follower for ${ownerId}:`, error);
  }
}

function extractAvailableYears() {
  const years = new Set<number>();
  
  allRoutes.forEach(route => {
    if (route.year) {
      years.add(route.year);
    }
  });
  
  availableYears = Array.from(years).sort((a, b) => b - a); // 최신 년도부터
}

function applyFilters() {
  let routes = [...allRoutes];

  // "내 여정" 필터 적용
  if (selectedFilter === 'my') {
    routes = routes.filter(r => r.owner === userID);
  }

  // 년도 필터 적용
  if (selectedYears.length > 0) {
    routes = routes.filter(r => r.year && selectedYears.includes(r.year));
  }

  // 검색어 적용
  if (searchKeyword.trim()) {
    const keyword = searchKeyword.toLowerCase();
    routes = routes.filter(r => 
      r.title.toLowerCase().includes(keyword)
    );
  }

  filteredRoutes = routes;
  totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  
  // 현재 페이지가 범위를 벗어나면 조정
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }
  if (currentPage < 1) {
    currentPage = 1;
  }
  
  updatePaginatedRoutes();
}

function toggleFilter(filter: string) {
  if (selectedFilter === filter) {
    selectedFilter = '';
  } else {
    selectedFilter = filter;
  }
  currentPage = 1;
  applyFilters();
}

function toggleYearFilter(year: number) {
  const index = selectedYears.indexOf(year);
  if (index >= 0) {
    selectedYears = selectedYears.filter(y => y !== year);
  } else {
    selectedYears = [...selectedYears, year];
  }
  currentPage = 1;
  applyFilters();
}

function resetFilters() {
  selectedFilter = '';
  selectedYears = [];
  currentPage = 1;
  applyFilters();
}

function updatePaginatedRoutes() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  paginatedRoutes = filteredRoutes.slice(startIndex, endIndex);
}

function changePage(page: number) {
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    updatePaginatedRoutes();
  }
}

function handleSearch() {
  currentPage = 1;
  applyFilters();
}

function getPageNumbers(): number[] {
  const maxVisible = 5;
  const pages: number[] = [];
  
  if (totalPages <= maxVisible) {
    // 총 페이지가 5개 이하면 모두 표시
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // 현재 페이지를 중심으로 5개 표시
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    // 끝에서 5개가 안되면 start 조정
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }
  
  return pages;
}

onMount(async () => {
	const user: any = await data.getAuthUser();
  userID = user.uid;
  loadRouteList()
  isAddDisabled = false;
});

async function addRoute() {
  if (isAddDisabled) {
    return;
  }
  isAddDisabled = true;
  const id = await createRoute();
  if (typeof id === 'string') {
    goto(`/route/${id}`);
  }
  isAddDisabled = false;
}

async function createRoute(): Promise<string | undefined> {
  if (typeof userID != 'string') {
    return;
  }
  try {
    const currentYear = new Date().getFullYear();
    
    // route-meta 생성 (메타데이터)
    const metaData: any = {
      title: '새로운 경로',
      author: userID,
      owner: userID,
      editors: [],
      viewers: [],
      isPublic: false,
      createdAt: serverTimestamp(),
      year: currentYear,
      pointsCount: 0,
    };
    
    const metaRef = collection(db, 'route-meta');
    const metaDoc = await addDoc(metaRef, metaData);
    const routeId = metaDoc.id;
    
    // route-detail 생성 (지도 데이터)
    await createRouteDetail(routeId, {
      points: [],
      split: [],
      paths: [],
      links: [],
    });
    
    return routeId;
  } catch (err) {
    console.error('Error adding document:', err);
  }
}

export let data;

function formatExecutedDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch (e) {
    return dateString;
  }
}
</script>

<style>
.route-page-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
  padding: 16px;
  box-sizing: border-box;
}

.search-container {
  margin-bottom: 16px;
  flex-shrink: 0;
}

:global(.search-container .mdc-text-field) {
  width: 100%;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.filter-chip {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 16px;
  background-color: #fff;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter-chip:hover {
  background-color: #f5f5f5;
  border-color: #bbb;
}

.filter-chip.active {
  background-color: #000;
  color: #fff;
  border-color: #000;
}

.filter-chip.reset {
  background-color: #fff;
  color: #999;
  border-color: #e0e0e0;
}

.filter-chip.reset:hover {
  background-color: #f5f5f5;
  border-color: #bbb;
  color: #666;
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

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.owner-name {
  font-size: 12px;
  color: #666;
  margin-right: 4px;
}
.owner-name.clickable {
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(0, 0, 0, 0.2);
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
}
.owner-name.clickable:hover {
  color: #333;
  text-decoration-color: rgba(0, 0, 0, 0.4);
}
.owner-name.owner-self {
  color: #999;
  text-decoration: none;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

:global(.pagination .page-nav-btn) {
  min-width: 40px;
  padding: 0 8px;
}

:global(.pagination .page-nav-btn .mdc-button__label) {
  display: none;
}

.page-numbers {
  display: flex;
  gap: 4px;
  align-items: center;
}

.page-number {
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover:not(.active) {
  background-color: #f5f5f5;
  border-color: #bbb;
}

.page-number.active {
  background-color: #6200ee;
  color: #fff;
  border-color: #6200ee;
  font-weight: 500;
}

.floating-control {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 100;
}

:global(.floating-control .mdc-fab) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* MenuSurface가 다른 요소 위에 표시되도록 */
:global(.user-menu-surface.mdc-menu-surface) {
  z-index: 1000 !important;
  position: fixed !important;
  top: auto !important;
  left: auto !important;
  height: fit-content !important;
  max-height: 400px !important;
  overflow-y: auto !important;
  transform-origin: left bottom !important;
  width: 100px !important;
}

:global(.user-menu-surface.mdc-menu-surface--open) {
  z-index: 1000 !important;
}

/* 메뉴 아이템 스타일 조정 */
:global(.user-menu-surface .mdc-list-item) {
  padding-left: 24px !important;
  padding-right: 24px !important;
  height: 40px !important;
  font-size: 14px !important;
}

:global(.user-menu-surface .mdc-list-item__text),
:global(.user-menu-surface .mdc-deprecated-list-item__text),
:global(.user-menu-surface .mdc-list-item__primary-text) {
  font-size: 14px !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
  box-sizing: border-box !important;
}
</style>
