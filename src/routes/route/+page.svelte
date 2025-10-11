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
                <div class="route-title">
                  <div class="title-text">
                    {route.title}
                  </div>
                  <div class="route-meta">
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
import { onMount } from 'svelte';
import { collection, getDocs, addDoc, query, orderBy, where, serverTimestamp } from 'firebase/firestore';
import List, { Item, Text } from '@smui/list';
import Fab, { Label, Icon } from '@smui/fab';
import Button from '@smui/button';
import Textfield from '@smui/textfield';
import { goto } from '$app/navigation';
import { db } from '$lib/firebase.client';
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
    
    extractAvailableYears();
    applyFilters();
  } catch (error) {
    console.error('Error loading routes:', error);
  } finally {
    isLoading = false;
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

.route-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.title-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 16px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
</style>
