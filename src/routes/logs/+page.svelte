
<div class="container">
	<header class:open={editMode}>
    <nav>
      <Fab class="nav-btn" color="primary" on:click={() => history.back()}>
        <Icon class="material-icons">arrow_back</Icon>
      </Fab>
      {#if editMode}
        <button class="date-range-btn" on:click={openDateDialog}>
          <Icon class="material-icons">filter_list</Icon>
          <span>{formatDateRange(startDate, endDate)}</span>
        </button>
      {/if}
    </nav>
		<ul class="menu">
      {#if availableRoutes.length === 0}
        <li class="empty-state">
          <div class="empty-message">
            <Icon class="material-icons">route</Icon>
            {#if startDate && endDate}
              <span>해당 기간에 저장된 여정이 없습니다</span>
              <span class="empty-hint">날짜를 조정해보세요</span>
            {:else}
              <span>저장된 여정이 없습니다</span>
            {/if}
          </div>
        </li>
      {:else}
        {#each availableRoutes as route, index}
        <li class:selected={selectedRoutes.includes(route.id || '')}>
          <Button 
            on:click={() => toggleRouteSelection(route.id || '')}
            variant="outlined"
          >
            <span class="seq">{index + 1}</span>
            <span class="title">{route.title}</span>
          </Button>
        </li>
        {/each}
      {/if}
		</ul>
    <div class="bottom">
      {#if selectedRoutes.length > 0}
        <div class="selection-info">
          <span>{selectedRoutes.length}개 여정 선택됨</span>
        </div>
      {/if}
      <div class="route-action">
        <Fab color="primary" on:click={showAllSelectedRoutes} mini disabled={selectedRoutes.length === 0}>
          <Icon class="material-icons">zoom_out_map</Icon>
        </Fab>
        <Fab color="secondary" on:click={clearAllSelections} mini disabled={selectedRoutes.length === 0}>
          <Icon class="material-icons">clear_all</Icon>
        </Fab>
      </div>
    </div>
    <button class="drawer" on:click={toggleEdit}>
      <Icon class="material-icons">{editMode ? 'arrow_back' : 'arrow_forward'}</Icon>
    </button>
	</header>
  <main>
    <div id="map"></div>
  </main>
</div>

<Dialog bind:open={dateDialogOpen}>
  <Title>경로 표시 조건</Title>
  <Content>
    <div class="date-selector">
      <div class="filter-section">
        <div class="switch-row">
          <span>내 경로만 보기</span>
          <Switch bind:checked={showMyRoutesOnly} on:change={handleFilterChange} />
        </div>
      </div>
      <div class="date-input-section">
        <div class="date-row">
          <span class="date-label">시작</span>
          <div class="date-input-group">
            <Textfield
              type="number"
              bind:value={tempStartYear}
              label="년도"
              style="width: 100px;"
              on:change={() => validateYearMonth('start')}
              class="number-input"
            />
            <Textfield
              type="number"
              bind:value={tempStartMonth}
              label="월"
              style="width: 80px;"
              on:change={() => validateYearMonth('start')}
              class="number-input"
            />
          </div>
        </div>
        <div class="date-row">
          <span class="date-label">종료</span>
          <div class="date-input-group">
            <Textfield
              type="number"
              bind:value={tempEndYear}
              label="년도"
              style="width: 100px;"
              on:change={() => validateYearMonth('end')}
              class="number-input"
            />
            <Textfield
              type="number"
              bind:value={tempEndMonth}
              label="월"
              style="width: 80px;"
              on:change={() => validateYearMonth('end')}
              class="number-input"
            />
          </div>
        </div>
      </div>
    </div>
  </Content>
  <Actions>
    <Button color="secondary">
      <Label>취소</Label>
    </Button>
    <Button on:click={applyDateSelection} action="accept">
      <Label>적용</Label>
    </Button>
  </Actions>
</Dialog>

<Snackbar bind:this={snackbar}>
  <SnackbarLabel>{snackbarMessage}</SnackbarLabel>
</Snackbar>

<script lang="ts">
import { onMount, tick } from 'svelte';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { goto } from '$app/navigation';
import Fab, { Label, Icon } from '@smui/fab';
import { Label as SnackbarLabel } from '@smui/snackbar';
import Button from '@smui/button';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Snackbar from '@smui/snackbar';
import Textfield from '@smui/textfield';
import Switch from '@smui/switch';
import { db } from '$lib/firebase.client';
import type { Point, RouteModel, RouteMetaModel } from '../../models/RouteModel';
import { canView } from '../../services/routeService';
import { getRouteDetail } from '../../services/routeDetailService';

let editMode: boolean = false;
let availableRoutes: RouteMetaModel[] = [];
let selectedRoutes: string[] = [];
let map: naver.maps.Map;
let routeLines: Map<string, naver.maps.Polyline> = new Map();
let userID: string;

const STORAGE_KEY = 'logs-selected-routes';
const DATE_RANGE_STORAGE_KEY = 'logs-date-range';

// 날짜 관련 상태
let startDate: Date;
let endDate: Date;
let dateDialogOpen: boolean = false;
let tempStartYear: number | null = null;
let tempStartMonth: number | null = null;
let tempEndYear: number | null = null;
let tempEndMonth: number | null = null;
let selectingField: 'startYear' | 'startMonth' | 'endYear' | 'endMonth' | null = null;
let snackbar: Snackbar;
let snackbarMessage: string = '';
let yearPickerPage: number = 0;
let monthPickerPage: number = 0;
let showMyRoutesOnly: boolean = false;

onMount(async () => {
  // 사용자 정보 가져오기
  const user: any = await data.getAuthUser();
  userID = user.uid;
  
  // 날짜 초기화
  initializeDateRange();
  
  // 여정 목록 로드
  await loadAvailableRoutes();
  
  // 지도 초기화
  initMap();
  
  // 저장된 선택 내용 복원
  const savedRoutes = loadSelectedRoutesFromStorage();
  let routesToSelect: string[] = [];
  
  if (savedRoutes.length > 0) {
    // 저장된 route id 중 유효한 것만 필터링
    const validRouteIds = availableRoutes.map(route => route.id || '').filter(id => id !== '');
    routesToSelect = savedRoutes.filter(id => validRouteIds.includes(id));
  }
  
  // 저장된 내용이 없거나 유효하지 않으면 기본값 적용
  if (routesToSelect.length === 0 && availableRoutes.length > 0) {
    const maxRoutes = Math.min(5, availableRoutes.length);
    routesToSelect = availableRoutes.slice(0, maxRoutes).map(route => route.id || '').filter(id => id !== '');
  }
  
  // 선택된 route 설정
  if (routesToSelect.length > 0) {
    selectedRoutes = routesToSelect;
    
    // 선택된 route들을 지도에 추가
    await Promise.all(routesToSelect.map(routeId => addRouteToMap(routeId)));
    
    // 선택된 route를 화면에 맞추기
    await showAllSelectedRoutes();
    
    // 스토리지에 저장
    saveSelectedRoutesToStorage(routesToSelect);
  }
});

async function loadAvailableRoutes() {
  try {
    // route-meta 컬렉션에서 여정 목록 조회
    const ref = collection(db, 'route-meta');
    const q = query(ref, orderBy('title'));
    const snapshot = await getDocs(q);
    
    // 권한이 있고 날짜 범위에 맞는 여정만 필터링
    availableRoutes = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as RouteMetaModel))
      .filter(route => {
        // 권한 체크
        if (!canView(route, userID)) {
          return false;
        }
        
        // 내 경로만 보기 필터링
        if (showMyRoutesOnly && route.owner !== userID) {
          return false;
        }
        
        // 날짜 범위 필터링
        if (startDate && endDate && route.createdAt) {
          let routeDate: Date;
          
          // Firestore Timestamp인 경우
          if (route.createdAt.toDate) {
            routeDate = route.createdAt.toDate();
          } 
          // 일반 Date 객체인 경우
          else if (route.createdAt instanceof Date) {
            routeDate = route.createdAt;
          }
          // 문자열인 경우
          else if (typeof route.createdAt === 'string') {
            routeDate = new Date(route.createdAt);
          }
          // 숫자(timestamp)인 경우
          else if (typeof route.createdAt === 'number') {
            routeDate = new Date(route.createdAt);
          }
          else {
            // createdAt 형식을 알 수 없으면 포함하지 않음
            return false;
          }
          
          // 날짜 범위 체크 (시간은 무시하고 날짜만 비교)
          const routeDateOnly = new Date(routeDate.getFullYear(), routeDate.getMonth(), routeDate.getDate());
          const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          
          return routeDateOnly >= startDateOnly && routeDateOnly <= endDateOnly;
        }
        
        // 날짜 범위가 설정되지 않았거나 createdAt이 없으면 모든 route 포함
        return true;
      });
  } catch (error) {
    console.error('Error loading routes:', error);
  }
}

async function handleFilterChange() {
  // 필터 변경 시 route 목록 다시 로드
  await loadAvailableRoutes();
  
  // 현재 선택된 route 중 유효하지 않은 것 제거
  const validRouteIds = availableRoutes.map(route => route.id || '').filter(id => id !== '');
  selectedRoutes = selectedRoutes.filter(id => validRouteIds.includes(id));
  
  // 유효한 route만 지도에 표시
  routeLines.forEach((line, routeId) => {
    if (!validRouteIds.includes(routeId)) {
      line.setMap(null);
      routeLines.delete(routeId);
    }
  });
  
  // 스토리지에 저장
  saveSelectedRoutesToStorage(selectedRoutes);
  
  // 선택된 경로에 맞게 줌 조정
  if (selectedRoutes.length > 0) {
    await showAllSelectedRoutes();
  }
}

function initMap() {
  const center: naver.maps.LatLng = new naver.maps.LatLng(37.431057, 127.102147);

  map = new naver.maps.Map('map', {
      center: center,
      zoom: 10
  });
}

async function toggleRouteSelection(routeId: string) {
  const index = selectedRoutes.indexOf(routeId);
  if (index >= 0) {
    // 이미 선택된 경우 제거
    selectedRoutes = selectedRoutes.filter(id => id !== routeId);
    removeRouteFromMap(routeId);
  } else {
    // 선택되지 않은 경우 추가
    selectedRoutes = [...selectedRoutes, routeId];
    await addRouteToMap(routeId);
  }
  
  // 스토리지에 저장
  saveSelectedRoutesToStorage(selectedRoutes);
  
  // 선택된 경로들에 맞게 줌 조정
  if (selectedRoutes.length > 0) {
    await showAllSelectedRoutes();
  }
}

async function addRouteToMap(routeId: string) {
  try {
    const routeDetail = await getRouteDetail(routeId);
    console.log('Route detail for', routeId, ':', routeDetail);
    
    if (!routeDetail || !routeDetail.points || routeDetail.points.length === 0) {
      console.log('No route detail or points found for', routeId);
      return;
    }

    // 마커는 표시하지 않으므로 변수 제거
    // const routeMarkers: naver.maps.Marker[] = [];

    // 경로 라인 그리기
    let pathPoints: naver.maps.LatLng[] = [];
    
    if (routeDetail.paths && routeDetail.paths.length > 0) {
      // 저장된 경로 데이터가 있는 경우
      console.log('Using saved paths:', routeDetail.paths.length, 'points');
      pathPoints = routeDetail.paths.map(point => 
        new naver.maps.LatLng(point.lat, point.lng)
      );
    } else if (routeDetail.points && routeDetail.points.length > 1) {
      // 경로 데이터가 없으면 포인트들을 직선으로 연결
      console.log('Using points as path:', routeDetail.points.length, 'points');
      pathPoints = routeDetail.points.map(point => 
        new naver.maps.LatLng(point.lat, point.lng)
      );
    }
    
    if (pathPoints.length > 0) {
      console.log('Drawing path with', pathPoints.length, 'points');
      const routeLine = new naver.maps.Polyline({
        map: map,
        path: pathPoints,
        strokeColor: '#FF4444', // 더 진한 빨간색으로 multiply 효과 강화
        strokeWeight: 5,
        strokeOpacity: 0.4 // 투명도를 더 낮춰서 multiply 효과 강화 (40%)
      });
      
      routeLines.set(routeId, routeLine);
    } else {
      console.log('No path points to draw for', routeId);
    }

    // 포인트 마커는 표시하지 않음 (경로만 표시)
    // routeDetail.points.forEach((point, index) => {
    //   const position = new naver.maps.LatLng(point.lat, point.lng);
    //   const content = `<div class="marker">${index + 1}</div>`;
    //   const size = new naver.maps.Size(30, 30);
    //   const anchor = new naver.maps.Point(15, 15);
    //   const icon = { content, size, anchor };
    //   
    //   const marker = new naver.maps.Marker({
    //     position,
    //     map,
    //     icon
    //   });
    //   
    //   routeMarkers.push(marker);
    // });

    // 마커는 표시하지 않으므로 설정 불필요
    // markers.set(routeId, routeMarkers);
  } catch (error) {
    console.error('Error adding route to map:', error);
  }
}

function removeRouteFromMap(routeId: string) {
  // 해당 여정과 관련된 라인 제거 (마커는 표시하지 않으므로 제거할 필요 없음)
  const routeLine = routeLines.get(routeId);
  if (routeLine) {
    routeLine.setMap(null);
    routeLines.delete(routeId);
  }

  // 마커는 표시하지 않으므로 제거 로직 불필요
  // const routeMarkers = markers.get(routeId);
  // if (routeMarkers) {
  //   routeMarkers.forEach(marker => marker.setMap(null));
  //   markers.delete(routeId);
  // }
}

async function showAllSelectedRoutes() {
  if (selectedRoutes.length === 0) return;
  
  // 모든 선택된 여정의 포인트를 포함하는 bounds 계산
  let allPoints: Point[] = [];
  
  for (const routeId of selectedRoutes) {
    try {
      const routeDetail = await getRouteDetail(routeId);
      if (routeDetail && routeDetail.points) {
        allPoints = [...allPoints, ...routeDetail.points];
      }
    } catch (error) {
      console.error('Error loading route for bounds:', error);
    }
  }
  
  if (allPoints.length === 0) return;
  
  const firstPoint = allPoints[0];
  let bounds = new naver.maps.LatLngBounds(
    new naver.maps.LatLng(firstPoint.lat, firstPoint.lng),
    new naver.maps.LatLng(firstPoint.lat, firstPoint.lng)
  );
  allPoints.forEach(point => {
    bounds.extend(new naver.maps.LatLng(point.lat, point.lng));
  });
  
  map.panToBounds(bounds);
}

function saveSelectedRoutesToStorage(routeIds: string[]) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routeIds));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
}

function loadSelectedRoutesFromStorage(): string[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(id => typeof id === 'string' && id !== '');
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }
  return [];
}

function clearAllSelections() {
  selectedRoutes = [];
  
  // 모든 라인 제거
  routeLines.forEach(line => line.setMap(null));
  routeLines.clear();
  
  // 스토리지에 저장
  saveSelectedRoutesToStorage([]);
  
  // 마커는 표시하지 않으므로 제거 로직 불필요
  // markers.forEach(routeMarkers => {
  //   routeMarkers.forEach(marker => marker.setMap(null));
  // });
  // markers.clear();
}

function getRandomColor(): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex] || '#4ECDC4';
}

function startEdit() {
  editMode = true;
}

function cancelEdit() {
  editMode = false;
}

function toggleEdit() {
  if (editMode) {
    cancelEdit()
  } else {
    startEdit()
  }
}

// 날짜 관련 함수들
function initializeDateRange() {
  const now = new Date();
  
  // 저장된 날짜 범위 불러오기
  const savedRange = loadDateRangeFromStorage();
  if (savedRange) {
    startDate = new Date(savedRange.startDate);
    endDate = new Date(savedRange.endDate);
  } else {
    // 기본값: 1년 전 월의 첫날부터 현재 월의 마지막날까지
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    oneYearAgo.setMonth(now.getMonth()); // 같은 월로 설정
    oneYearAgo.setDate(1); // 월의 첫 날로 설정
    oneYearAgo.setHours(0, 0, 0, 0);
    
    startDate = oneYearAgo;
    
    // 현재 월의 마지막날
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfCurrentMonth.setHours(23, 59, 59, 999);
    endDate = endOfCurrentMonth;
  }
}

function formatMonthDate(date: Date): string {
  const year = String(date.getFullYear()).slice(-2);
  const month = date.getMonth() + 1;
  return `${year}.${month}`;
}

function openDateDialog() {
  // 임시 값 초기화 - startDate와 endDate에서 년/월 추출
  if (startDate) {
    tempStartYear = startDate.getFullYear();
    tempStartMonth = startDate.getMonth() + 1;
  } else {
    tempStartYear = null;
    tempStartMonth = null;
  }
  
  if (endDate) {
    tempEndYear = endDate.getFullYear();
    tempEndMonth = endDate.getMonth() + 1;
  } else {
    tempEndYear = null;
    tempEndMonth = null;
  }
  
  selectingField = null;
  yearPickerPage = 0;
  monthPickerPage = 0;
  
  dateDialogOpen = true;
}

function openPicker(field: 'startYear' | 'startMonth' | 'endYear' | 'endMonth') {
  selectingField = field;
  
  // 페이지 초기화 (현재 값이 있으면 그 값이 중심에 오도록)
  if (field.includes('Year')) {
    yearPickerPage = 0;
  } else {
    monthPickerPage = 0;
  }
}

function getCurrentValue(): number | null {
  if (!selectingField) return null;
  
  if (selectingField === 'startYear') return tempStartYear;
  if (selectingField === 'startMonth') return tempStartMonth;
  if (selectingField === 'endYear') return tempEndYear;
  if (selectingField === 'endMonth') return tempEndMonth;
  
  return null;
}

function getPickerItems(): number[] {
  if (!selectingField) return [];
  
  const isYear = selectingField.includes('Year');
  const currentValue = getCurrentValue();
  
  if (isYear) {
    // 년도: 현재 값 기준 앞뒤 10개씩 (없으면 현재 년도 기준)
    const baseYear = currentValue || new Date().getFullYear();
    const centerYear = baseYear + (yearPickerPage * 21); // 페이지당 21개씩 이동
    const items: number[] = [];
    
    // 앞 10개 + 현재 + 뒤 10개 = 총 21개
    for (let i = -10; i <= 10; i++) {
      items.push(centerYear + i);
    }
    
    return items;
  } else {
    // 월: 1-12 모두 표시 (페이징 불필요)
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }
}

function changePage(direction: number) {
  if (!selectingField) return;
  
  if (selectingField.includes('Year')) {
    yearPickerPage += direction;
    // 제한 없이 페이지 이동 가능
  } else {
    monthPickerPage += direction;
    // 제한 없이 페이지 이동 가능
  }
}

function selectPickerItem(item: number) {
  if (!selectingField) return;
  
  if (selectingField === 'startYear') {
    tempStartYear = item;
    validateYearMonth('start');
  } else if (selectingField === 'startMonth') {
    tempStartMonth = item;
    validateYearMonth('start');
  } else if (selectingField === 'endYear') {
    tempEndYear = item;
    validateYearMonth('end');
  } else if (selectingField === 'endMonth') {
    tempEndMonth = item;
    validateYearMonth('end');
  }
  
  // 피커 닫기
  selectingField = null;
}

function isPickerItemSelected(item: number): boolean {
  const currentValue = getCurrentValue();
  return currentValue === item;
}

function validateYearMonth(type: 'start' | 'end') {
  if (type === 'start') {
    // 월 유효성 검사
    if (tempStartMonth !== null) {
      if (tempStartMonth < 1) tempStartMonth = 1;
      if (tempStartMonth > 12) tempStartMonth = 12;
    }
  } else {
    // 월 유효성 검사
    if (tempEndMonth !== null) {
      if (tempEndMonth < 1) tempEndMonth = 1;
      if (tempEndMonth > 12) tempEndMonth = 12;
    }
  }
}

function formatDateRange(start: Date, end: Date): string {
  const startYear = start.getFullYear();
  const startMonth = start.getMonth() + 1;
  const endYear = end.getFullYear();
  const endMonth = end.getMonth() + 1;
  
  return `${startYear}.${startMonth} - ${endYear}.${endMonth}`;
}

function showSnackbar(message: string) {
  snackbarMessage = message;
  snackbar.open();
}

function cancelDateSelection() {
  // 원래 값으로 복원
  if (startDate) {
    tempStartYear = startDate.getFullYear();
    tempStartMonth = startDate.getMonth() + 1;
  } else {
    tempStartYear = null;
    tempStartMonth = null;
  }
  
  if (endDate) {
    tempEndYear = endDate.getFullYear();
    tempEndMonth = endDate.getMonth() + 1;
  } else {
    tempEndYear = null;
    tempEndMonth = null;
  }
  
  selectingField = null;
  dateDialogOpen = false;
}

async function applyDateSelection() {
  // 유효성 검사
  if (tempStartYear === null || tempStartMonth === null) {
    showSnackbar('시작년도와 월을 선택해주세요');
    return;
  }
  
  if (tempEndYear === null || tempEndMonth === null) {
    showSnackbar('종료년도와 월을 선택해주세요');
    return;
  }
  
  // 월 유효성 검사
  if (tempStartMonth < 1 || tempStartMonth > 12) {
    showSnackbar('시작월은 1-12 사이의 값이어야 합니다');
    return;
  }
  
  if (tempEndMonth < 1 || tempEndMonth > 12) {
    showSnackbar('종료월은 1-12 사이의 값이어야 합니다');
    return;
  }
  
  // 날짜 범위 설정 - 월의 첫날과 마지막날로 설정
  const startYear = tempStartYear;
  const startMonth = tempStartMonth;
  const endYear = tempEndYear;
  const endMonth = tempEndMonth;
  
  // 시작일과 종료일 비교
  const startValue = startYear * 12 + startMonth;
  const endValue = endYear * 12 + endMonth;
  
  let finalStartYear = startYear;
  let finalStartMonth = startMonth;
  let finalEndYear = endYear;
  let finalEndMonth = endMonth;
  
  if (startValue > endValue) {
    // 시작일이 종료일보다 늦으면 교환
    finalStartYear = endYear;
    finalStartMonth = endMonth;
    finalEndYear = startYear;
    finalEndMonth = startMonth;
  }
  
  // 시작월의 첫날
  startDate = new Date(finalStartYear, finalStartMonth - 1, 1);
  startDate.setHours(0, 0, 0, 0);
  
  // 종료월의 마지막날
  endDate = new Date(finalEndYear, finalEndMonth, 0); // 다음 달 0일 = 이번 달 마지막일
  endDate.setHours(23, 59, 59, 999);
  
  // 스토리지에 저장
  saveDateRangeToStorage({ startDate, endDate });
  
  dateDialogOpen = false;
  
  // 날짜 범위 변경 시 route 목록 다시 로드
  await loadAvailableRoutes();
  
  // 현재 선택된 route 중 유효하지 않은 것 제거
  const validRouteIds = availableRoutes.map(route => route.id || '').filter(id => id !== '');
  selectedRoutes = selectedRoutes.filter(id => validRouteIds.includes(id));
  
  // 유효한 route만 지도에 표시
  routeLines.forEach((line, routeId) => {
    if (!validRouteIds.includes(routeId)) {
      line.setMap(null);
      routeLines.delete(routeId);
    }
  });
  
  // 스토리지에 저장
  saveSelectedRoutesToStorage(selectedRoutes);
}

function saveDateRangeToStorage(range: { startDate: Date; endDate: Date }) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(DATE_RANGE_STORAGE_KEY, JSON.stringify({
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString()
      }));
    } catch (error) {
      console.error('Error saving date range to localStorage:', error);
    }
  }
}

function loadDateRangeFromStorage(): { startDate: string; endDate: string } | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = localStorage.getItem(DATE_RANGE_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading date range from localStorage:', error);
    }
  }
  return null;
}

export let data;
</script>

<style>
.container {
  display: flex;
  height: 100%;
}

header {
  display: flex;
  position: relative;
  z-index: 10;
  width: 0;
  flex-direction: column;
  background-color: transparent;
  user-select: none;
  transition: width .5s;
}

/* Dialog가 header 위에 표시되도록 */
:global(.mdc-dialog) {
  z-index: 1000 !important;
}

:global(.mdc-dialog__scrim) {
  z-index: 999 !important;
}

:global(.mdc-dialog__surface) {
  z-index: 1001 !important;
  position: relative;
}

header.open {
  width: 400px;
  background-color: #fff;
  box-shadow:
    0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 5px 8px 0px rgba(0, 0, 0, 0.14),
    0px 1px 14px 0px rgba(0, 0, 0, 0.12);
}

nav {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  z-index: 9;
  background-color: transparent;
}

header.open nav {
  background-color: #fff;
}

:global(nav .nav-btn) {
  margin-top: 5px;
  margin-bottom: 5px;
  flex-shrink: 0;
}

.date-range-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 24px;
  cursor: pointer;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
  min-height: 48px;
  transition: background-color 0.2s;
}

.date-range-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.date-range-btn :global(.material-icons) {
  font-size: 20px;
}

.bottom {
  position: absolute;
  box-sizing: border-box;
  bottom: 0;
  right: 0;
  width: 400px;
  background-color: #fff;
}

.bottom .route-action {
  padding: 10px;
  border-top: #eee 1px solid;
  text-align: right;
}

:global(.bottom .route-action > button) {
  vertical-align: middle;
}

/* 드로어 버튼 영역에만 배경 적용 */
button.drawer {
  position: absolute;
  box-sizing: border-box;
  bottom: 25px;
  right: -40px;
  width: 40px;
  height: 50px;
  text-align: center;
  padding: 12px 8px;
  background-color: #000;
  cursor: pointer;
  color: #fff;
  border: none;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

ul.menu {
  overflow-x: visible;
  overflow-y: auto;
  min-width: 68px;
  margin-top: -38px;
  margin-bottom: 0;
  padding: 38px 4px 80px 4px;
  /* 스크롤바 숨기기 */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

ul.menu::-webkit-scrollbar {
  display: none;  /* Chrome, Safari, Opera */
}

header.open ul.menu {
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 120px;
}

ul.menu > li {
  display: block;
  box-sizing: border-box;
  min-width: 40px;
  padding: 5px 14px;
  color: #fff;
  font-size: 11px;
  white-space: nowrap;
}

/* 선택된 버튼 스타일 */
:global(ul.menu > li.selected .mdc-button) {
  background-color: #000 !important;
  color: white !important;
  border: none !important;
}

/* 선택되지 않은 버튼 스타일 */
:global(ul.menu > li:not(.selected) .mdc-button) {
  background-color: rgba(255, 255, 255, 0.5);
  color: #000 !important;
  border: 1px solid #000 !important;
}

/* SMUI 버튼 스타일 조정 */
:global(ul.menu > li .mdc-button) {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  width: 100% !important;
  height: 40px !important;
  margin: 2px 0 !important;
  padding: 0 8px !important;
  border-radius: 20px !important;
  font-size: 11px !important;
  text-transform: none !important;
  min-width: auto !important;
}

/* 리플 효과 radius 조정 */
:global(ul.menu > li .mdc-button .mdc-ripple-surface) {
  border-radius: 20px !important;
}

:global(ul.menu > li .mdc-button .mdc-button__ripple) {
  border-radius: 20px !important;
}

/* 선택된 상태의 배경 radius 조정 */
:global(ul.menu > li.selected .mdc-button::before) {
  border-radius: 20px !important;
}

:global(ul.menu > li.selected .mdc-button::after) {
  border-radius: 20px !important;
}

/* MDC 버튼의 내부 요소들 radius 조정 */
:global(ul.menu > li .mdc-button .mdc-button__touch) {
  border-radius: 20px !important;
}

:global(ul.menu > li .mdc-button .mdc-button__focus-ring) {
  border-radius: 20px !important;
}

:global(ul.menu > li .mdc-button .mdc-button__ripple) {
  border-radius: 20px !important;
}

:global(ul.menu > li .mdc-button .mdc-ripple-upgraded) {
  border-radius: 20px !important;
}

/* 선택된 상태의 내부 요소들 radius 조정 */
:global(ul.menu > li.selected .mdc-button .mdc-button__touch) {
  border-radius: 20px !important;
}

:global(ul.menu > li.selected .mdc-button .mdc-button__focus-ring) {
  border-radius: 20px !important;
}

:global(ul.menu > li.selected .mdc-button .mdc-button__ripple) {
  border-radius: 20px !important;
}

:global(ul.menu > li.selected .mdc-button .mdc-ripple-upgraded) {
  border-radius: 20px !important;
}

ul.menu span.seq {
  display: inline-block;
  width: 24px;
  height: 24px;
  text-align: center;
  line-height: 24px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
}

ul.menu span.title {
  display: inline-block;
  overflow: hidden;
  max-width: 280px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}


ul.menu > li:first-of-type {
  z-index: 9;
}

main {
  position: relative;
  display: block;
  flex: 1 1 auto;
  mix-blend-mode: multiply;
}

#map {
  position: absolute !important;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}



:global(#map .marker) {
  display:block;
  margin: 0px;
  padding: 0px;
  border: 0px solid transparent;
  border-radius: 13px;
  overflow: hidden;
  background-color: #9ea6af;
  max-width: none;
  max-height: none;
  user-select: none;
  position: absolute;
  width: 26px;
  height: 26px;
  left: 0px;
  top: 0px;
  text-align: center;
  line-height: 28px;
  color: #fff;
  font-size: 11px;
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
}

/* 빈 상태 스타일 */
.empty-state {
  padding: 20px;
  text-align: center;
  color: #666;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-message :global(.material-icons) {
  font-size: 32px;
  color: #ccc;
}

.empty-hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 4px;
}

/* 선택 정보 스타일 */
.selection-info {
  padding: 8px 16px;
  background-color: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 12px;
  color: #000;
  text-align: center;
}

/* 날짜 선택 다이얼로그 스타일 */
.date-selector {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 280px;
}

.date-input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.date-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-label {
  width: 50px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.filter-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

/* 숫자 입력 필드의 증가/감소 버튼 제거 */
.number-input :global(input[type="number"]::-webkit-inner-spin-button),
.number-input :global(input[type="number"]::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.number-input :global(input[type="number"]) {
  -moz-appearance: textfield;
}

.picker-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.picker-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.picker-item {
  padding: 12px 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.picker-item:hover {
  background-color: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.24);
}

.picker-item.selected {
  background-color: #000;
  color: white;
  border-color: #000;
  font-weight: 500;
}

</style>
  