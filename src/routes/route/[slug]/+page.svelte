<Dialog
  bind:open={isOpenSearchDialog}
  aria-labelledby="searchTitle"
  aria-describedby="searchContent"
>
  <Title id="searchTitle">검색</Title>
  <Content id="searchContent">
    <div class="editing-text">
      <Textfield on:keypress={keyDidPress} bind:value={searchKeyword} label="검색어" />
    </div>
  </Content>
  <Actions>
    <Button color="secondary">
      <Label>취소</Label>
    </Button>
    <Button on:click={submitSearch} action="accept">
      <Label>확인</Label>
    </Button>
  </Actions>
</Dialog>

<Dialog
  bind:open={isOpenPointEditDialog}
  aria-labelledby="editingTitle"
  aria-describedby="editingContent"
>
  <Title id="editingTitle">편집</Title>
  <Content id="editingContent">
    <div class="editing-text">
      <Textfield bind:value={editingPointTitle} label="Title" />
    </div>
    <div class="editing-point">
      <div>
        <span>LatLng</span>
        <Switch bind:checked={isPointEditDialogCoordModeEPSG4236} icons={false} />
        <span>EPSG4236</span>
      </div>
      {#if isPointEditDialogCoordModeEPSG4236}
      <Textfield bind:value={editingPointX} on:change={applyEditingPointEPSG4236} label="X" />
      <Textfield bind:value={editingPointY} on:change={applyEditingPointEPSG4236} label="Y" />
      {:else}
      <Textfield bind:value={editingPointLat} on:change={applyEditingPoint} label="Latitude" />
      <Textfield bind:value={editingPointLng} on:change={applyEditingPoint} label="Longitude" />
      {/if}
    </div>
  </Content>
  <Actions>
    <Button on:click={completeEditing} action="accept">
      <Label>완료</Label>
    </Button>
  </Actions>
</Dialog>

<Dialog
  bind:open={isOpenDeleteDialog}
  aria-labelledby="confirmTitle"
  aria-describedby="confirmContent"
>
  <Title id="confirmTitle">편집</Title>
  <Content id="confirmContent">
    <div class="editing-text">
      <Textfield bind:value={confirmDeleteTitle} label="Confirm Title" />
    </div>
  </Content>
  <Actions>
    <Button color="secondary">
      <Label>취소</Label>
    </Button>
    <Button on:click={submitDelete} action="accept">
      <Label>확인</Label>
    </Button>
  </Actions>
</Dialog>

<Dialog
  bind:open={isOpenCancelDialog}
  aria-labelledby="cancelTitle"
  aria-describedby="cancelContent"
>
  <Title id="cancelTitle">변경 사항 취소</Title>
  <Content id="cancelContent">
    <p>모든 변경 사항이 저장하기 이전 상태로 초기화됩니다.</p>
    <p>계속하시겠습니까?</p>
  </Content>
  <Actions>
    <Button color="secondary">
      <Label>아니오</Label>
    </Button>
    <Button on:click={confirmCancelEdit} action="accept">
      <Label>예</Label>
    </Button>
  </Actions>
</Dialog>

<Dialog
  bind:open={isOpenImportURLDialog}
  aria-labelledby="importURLTitle"
  aria-describedby="importURLContent"
>
  <Title id="importURLTitle">네이버 지도 주소 입력</Title>
  <Content id="importURLContent">
    <div class="editing-text">
      <Textfield bind:value={importURL} label="URL" />
    </div>
  </Content>
  <Actions>
    <Button color="secondary">
      <Label>취소</Label>
    </Button>
    <Button on:click={submitImportURL} action="accept">
      <Label>확인</Label>
    </Button>
  </Actions>
</Dialog>

<Dialog
  bind:open={isOpenPermissionDialog}
  aria-labelledby="permissionTitle"
  aria-describedby="permissionContent"
  class="permission-dialog"
>
  <Title id="permissionTitle">권한 관리</Title>
  <Content id="permissionContent">
    <div class="permission-section">
      <h4>공개 설정</h4>
      <div class="switch-row">
        <span>공개 여정</span>
        <Switch bind:checked={editingIsPublic} />
      </div>
      <p class="hint">공개 여정은 모든 사용자가 볼 수 있습니다.</p>
    </div>

    <div class="permission-section">
      <h4>편집 권한 (Editor)</h4>
      <div class="user-input-row">
        <Textfield 
          bind:value={newEditorEmail} 
          label="이메일 주소" 
          style="flex: 1;"
        />
        <Button on:click={addEditor} variant="outlined">
          <Icon class="material-icons">add</Icon>
          <Label>추가</Label>
        </Button>
      </div>
      <List class="user-list" dense>
        {#each editingEditors as editor}
        <ItemWithMeta>
          <Text>{editor}</Text>
          <span slot="meta">
            <Button on:click={() => removeEditor(editor)}>
              <Icon class="material-icons">close</Icon>
            </Button>
          </span>
        </ItemWithMeta>
        {/each}
      </List>
    </div>

    <div class="permission-section">
      <h4>보기 권한 (Viewer)</h4>
      <div class="user-input-row">
        <Textfield 
          bind:value={newViewerEmail} 
          label="이메일 주소" 
          style="flex: 1;"
        />
        <Button on:click={addViewer} variant="outlined">
          <Icon class="material-icons">add</Icon>
          <Label>추가</Label>
        </Button>
      </div>
      <List class="user-list" dense>
        {#each editingViewers as viewer}
        <ItemWithMeta>
          <Text>{viewer}</Text>
          <span slot="meta">
            <Button on:click={() => removeViewer(viewer)}>
              <Icon class="material-icons">close</Icon>
            </Button>
          </span>
        </ItemWithMeta>
        {/each}
      </List>
    </div>
  </Content>
  <Actions>
    <Button color="secondary">
      <Label>취소</Label>
    </Button>
    <Button on:click={savePermissions} action="accept">
      <Label>저장</Label>
    </Button>
  </Actions>
</Dialog>

<Snackbar bind:this={snackbar}>
  <Label>{snackbarMessage}</Label>
</Snackbar>

<div class="container">
	<header class:open={headerOpen}>
    <nav>
      <Fab class="nav-btn" color="primary" on:click={() => history.back()}>
        <Icon class="material-icons">arrow_back</Icon>
      </Fab>
      <!--<Fab class="nav-btn" color="primary" on:click={() => isOpenSearchDialog = true}>
        <Icon class="material-icons">search</Icon>
      </Fab>-->
    </nav>
		<ul class="menu">
      {#each points as point, index}
      <li class:selected={selectedPointIndex === index}>
        {#if editMode}
        <button class="icon" on:click={() => {editPoint(index)}}>
          <Icon class="material-icons">edit</Icon>
        </button>
        <button class="icon" on:click={() => {toggleSplit(index)}}>
          <Icon class="material-icons">{index === 0 || (index + 1) === points.length || split.indexOf(index) != -1 ? 'location_on' : 'location_off'}</Icon>
        </button>
        {/if}
        <button on:click={() => selectPoint(index)}>
          <span class="seq">{index + 1}</span>
          <span class="title">{point.title}</span>
        </button>
      </li>
      {/each}
    </ul>
    <div class="bottom">
      <div class="date-action">
        <Textfield 
          type="date" 
          bind:value={executedDate} 
          label="실행 날짜" 
          disabled={!editMode}
          placeholder={executedDate ? '' : '미정'}
        />
      </div>
      {#if editMode}
        <div class="point-action">
          <div class="tooltip-wrapper" title="모든 지점 삭제">
            <Fab color="secondary" on:click={removeAlldPoint} mini disabled={points.length === 0}>
              <Icon class="material-icons">playlist_remove</Icon>
            </Fab>
          </div>
          <div class="tooltip-wrapper" title="선택한 지점 삭제">
            <Fab color="secondary" on:click={removeSelectedPoint} mini>
              <Icon class="material-icons">remove</Icon>
            </Fab>
          </div>
          <div class="tooltip-wrapper" title="선택한 지점 아래로 이동">
            <Fab color="primary" on:click={moveSelectedPointDown} mini disabled={selectedPointIndex === (points.length - 1)}>
              <Icon class="material-icons">arrow_drop_down</Icon>
            </Fab>
          </div>
          <div class="tooltip-wrapper" title="선택한 지점 위로 이동">
            <Fab color="primary" on:click={moveSelectedPointUp} mini disabled={selectedPointIndex === 0}>
              <Icon class="material-icons">arrow_drop_up</Icon>
            </Fab>
          </div>
          <div class="tooltip-wrapper" title="현재 위치에 지점 추가">
            <Fab color="primary" on:click={addCurrentPoint} mini>
              <Icon class="material-icons">add</Icon>
            </Fab>
          </div>
          <div class="tooltip-wrapper" title="네이버 지도 URL에서 경로 가져오기">
            <Fab color="primary" on:click={openImportURLDialog} mini>
              <Icon class="material-icons">input</Icon>
            </Fab>
          </div>
        </div>
      {/if}
      <div class="route-action">
        <div class="tooltip-wrapper tooltip-right-align" title="모든 지점이 보이도록 지도 조정">
          <Fab color="primary" on:click={showAllPoints} mini>
            <Icon class="material-icons">zoom_out_map</Icon>
          </Fab>
        </div>
        {#if editMode}
          <div class="tooltip-wrapper" title="경로 자동 생성">
            <Fab color="primary" on:click={handleLoadDirections} mini>
              <Icon class="material-icons">route</Icon>
            </Fab>
          </div>
          <div class="tooltip-wrapper" title="모든 경로 링크 생성">
            <Fab color="primary" on:click={makeAllLinks} mini>
              <Icon class="material-icons">link</Icon>
            </Fab>
          </div>
          {#if canManagePermissions(model, userID)}
          <div class="tooltip-wrapper" title="권한 관리">
            <Fab color="primary" on:click={openPermissionDialog} mini>
              <Icon class="material-icons">share</Icon>
            </Fab>
          </div>
          {/if}
          {#if canDelete(model, userID)}
          <div class="tooltip-wrapper" title="여정 삭제">
            <Fab color="secondary" on:click={deleteRoute} mini>
              <Icon class="material-icons">delete</Icon>
            </Fab>
          </div>
          {/if}
          <Button on:click={saveEdit} variant="raised" color="secondary" disabled={!hasUnsavedChanges}>
            <Label>저장</Label>
          </Button>
          <Button on:click={cancelEdit} variant="raised" color="primary" disabled={!hasUnsavedChanges}>
            <Label>취소</Label>
          </Button>
        {/if}
      </div>
    </div>
    <button class="drawer" on:click={toggleHeader}>
      <Icon class="material-icons">{headerOpen ? 'arrow_back' : 'arrow_forward'}</Icon>
    </button>
	</header>
  <main>
    <div id="map"></div>
  </main>
  <div class="title-layer" bind:this={titleFieldElement}>
    <Textfield bind:value={title} label="제목" disabled={!editMode} />
  </div>
  <ul class="link-box">
    {#each links as link, index}
    <li>
      <Button on:click={() => copyToClipboard(link)} variant="raised">
        <Label>경로{index + 1} 링크복사</Label>
      </Button>
    </li>
    {/each}
  </ul>
</div>

<script lang="ts">
import { onMount, tick } from 'svelte';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import Textfield from '@smui/textfield';
import Button from '@smui/button';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Fab, { Label, Icon } from '@smui/fab';
import Switch from '@smui/switch';
import Snackbar from '@smui/snackbar';
import List, { Item, Text } from '@smui/list';

// @ts-ignore - SMUI List Item supports meta slot but TypeScript types are incomplete
const ItemWithMeta = Item as any;
import { db } from '$lib/firebase.client';
import type { Point, RouteModel } from '../../../models/RouteModel';
import { canEdit, canDelete, canManagePermissions, getUserPermission } from '../../../services/routeService';
import type { RoutePermission } from '../../../models/RouteModel';
import { getRouteMeta, updateRouteMeta, deleteRouteMeta } from '../../../services/routeMetaService';
import { getRouteDetail, updateRouteDetail, deleteRouteDetail } from '../../../services/routeDetailService';
import { loadDirection, loadAllDirections } from '../../../services/mapDirectionService';

let model: RouteModel = {
  title: '',
  author: undefined,
  owner: undefined,
  editors: [],
  viewers: [],
  isPublic: false,
  points: [],
  split: [],
  paths: [],
  links: [],
};

let userPermission: RoutePermission;

let userID: string;
let title = '';
let executedDate = ''; // 실행 날짜 (YYYY-MM-DD 형식)
let snackbar: Snackbar;
let snackbarMessage = '';
const maxPoints = 6;

// 초기 상태 저장 (변경 감지 및 취소 시 복원용)
let initialTitle = '';
let initialExecutedDate = '';
let initialPoints: Point[] = [];
let initialSplit: number[] = [];
let initialPaths: number[][] = [];
let initialLinks: (string | null)[] = [];

// 변경 감지 (reactive) - 모든 상태 변경을 감지하도록 의존성 명시
$: hasUnsavedChanges = editMode && (
  title !== initialTitle ||
  executedDate !== initialExecutedDate ||
  points.length !== initialPoints.length ||
  JSON.stringify(points) !== JSON.stringify(initialPoints) ||
  JSON.stringify(split) !== JSON.stringify(initialSplit) ||
  JSON.stringify(paths) !== JSON.stringify(initialPaths) ||
  JSON.stringify(links) !== JSON.stringify(initialLinks)
);
let isOpenSearchDialog = false;
let isOpenPointEditDialog = false;
let isPointEditDialogCoordModeEPSG4236 = false;
let isOpenDeleteDialog = false;
let isOpenCancelDialog = false;
let isOpenImportURLDialog = false;
let isOpenPermissionDialog = false;
let editMode: boolean = false;
let headerOpen: boolean = false;
let titleFieldElement: HTMLElement | null = null;
let selectedPointIndex = -1;
let editingPointIndex = -1;
let editingPointTitle = '';
let editingPointLat = 0;
let editingPointLng = 0;
let editingPointX = 0;
let editingPointY = 0;
let points: Point[] = [];
let markers: naver.maps.Marker[] = [];
let split: number[] = [];
let paths: number[][] = [];
let map: naver.maps.Map;
let routeLine: naver.maps.Polyline;
let links: (string | null)[] = [];
let confirmDeleteTitle = '';
let importURL = '';
let searchKeyword = '';

// 권한 관리 관련 변수
let editingIsPublic = false;
let editingEditors: string[] = [];
let editingViewers: string[] = [];
let newEditorEmail = '';
let newViewerEmail = '';

function showSnackbar(message: string) {
  snackbarMessage = message;
  snackbar.open();
}

function drawPath(path: naver.maps.LatLng[]) {
  if (!routeLine) {
    return; // routeLine이 아직 초기화되지 않았으면 무시
  }
  if (path.length === 0) {
    routeLine.setMap(null);
  } else {
    routeLine.setOptions({
      map: map,
      strokeOpacity: 1,
      path: path,
    });
  }
}

async function loadRouteModel() {
  // route-meta와 route-detail을 각각 조회
  const [meta, detail] = await Promise.all([
    getRouteMeta(data.id),
    getRouteDetail(data.id)
  ]);
  
  if (!meta || !detail) {
    showSnackbar('여정을 찾을 수 없습니다.');
    setTimeout(() => goto('/route'), 1000);
    return;
  }
  
  // 두 데이터를 합쳐서 RouteModel 생성
  model = { ...meta, ...detail, id: data.id } as RouteModel;
  
  // 권한 체크
  userPermission = getUserPermission(model, userID);
  
  // 권한이 없으면 목록으로 리다이렉트
  if (userPermission === 'none') {
    showSnackbar('이 여정을 볼 권한이 없습니다.');
    setTimeout(() => {
      goto('/route');
    }, 1000);
    return;
  }
  
  title = model.title;
  executedDate = model.executedDate || '';
  if (Array.isArray(model.split)) {
    split = model.split;
  } else {
    split = [];
  }
  if (Array.isArray(model.paths)) {
    paths = model.paths.map(path => [path.lng, path.lat]);
    drawPath(paths.map(point => (new naver.maps.LatLng(point[1], point[0]))));
  } else {
    paths = [];
  }
  if (Array.isArray(model.links)) {
    links = model.links;
  }
  
  // 초기 상태 저장
  saveInitialState();
  if (Array.isArray(model.points) && model.points.length > 0) {
    applyPoints(model.points);
    showAllPoints();
  } else {
    // points가 없거나 빈 배열인 경우 기본 줌 레벨로 설정
    const defaultCenter = new naver.maps.LatLng(37.5666805, 126.9784147);
    map.setCenter(defaultCenter);
    map.setZoom(10);
  }
  
  // 권한이 없으면 편집 모드로 전환되지 않도록
  if (!canEdit(model, userID)) {
    editMode = false;
  }
}

async function saveRouteModel(): Promise<boolean> {
  try {
    // route-detail 업데이트 (지도 데이터)
    await updateRouteDetail(data.id, {
      points,
      split,
      paths: paths.map(path => ({ lat: path[1], lng: path[0] } as Point)),
      links: links.filter((link): link is string => link !== null),
    });
    
    // 실행 날짜의 연도와 현재 year 비교하여 동기화
    let yearToUpdate = model.year;
    if (executedDate) {
      const executedYear = new Date(executedDate).getFullYear();
      if (model.year !== executedYear) {
        yearToUpdate = executedYear;
      }
    } else if (executedDate === '' && model.executedDate) {
      // 실행 날짜가 삭제된 경우, year는 유지 (필요시 변경 가능)
    }
    
    // route-meta 업데이트 (메타데이터)
    await updateRouteMeta(data.id, {
      title,
      executedDate: executedDate || undefined,
      year: yearToUpdate,
      pointsCount: points.length,
    });
    
    return true;
  } catch (error) {
    console.error('Save route model error:', error);
    return false;
  }
}

function deleteRoute() {
  isOpenDeleteDialog = true;
}

async function submitDelete() {
  if (!canDelete(model, userID)) {
    showSnackbar('삭제 권한이 없습니다.');
    return;
  }
  if (model.title != confirmDeleteTitle) {
    showSnackbar('입력 내용이 일치하지 않습니다.');
    return;
  }

  try {
    // route-detail과 route-meta 모두 삭제
    await Promise.all([
      deleteRouteDetail(data.id),
      deleteRouteMeta(data.id)
    ]);
    
    goto('/route');
  } catch (error) {
    console.error('Delete route model error:', error);
  }
}

function keyDidPress(event: CustomEvent<any>) {
  const keyboardEvent = event as unknown as KeyboardEvent
  console.log(event)
  console.log(keyboardEvent)
  if (keyboardEvent?.keyCode === 13) {
    submitSearch()
    isOpenSearchDialog = false
  }
}

async function submitSearch() {
  console.log('search', searchKeyword)
}

function openImportURLDialog() {
  importURL = '';
  isOpenImportURLDialog = true;
}

function openPermissionDialog() {
  if (!canManagePermissions(model, userID)) {
    showSnackbar('권한 관리 권한이 없습니다.');
    return;
  }
  
  // 현재 권한 정보를 복사
  editingIsPublic = model.isPublic ?? false;
  editingEditors = [...(model.editors ?? [])];
  editingViewers = [...(model.viewers ?? [])];
  newEditorEmail = '';
  newViewerEmail = '';
  
  isOpenPermissionDialog = true;
}

function addEditor() {
  const email = newEditorEmail.trim();
  if (!email) {
    showSnackbar('이메일 주소를 입력해주세요.');
    return;
  }
  
  // 이메일 형식 검증 (간단한 검증)
  if (!email.includes('@')) {
    showSnackbar('올바른 이메일 주소를 입력해주세요.');
    return;
  }
  
  // 이미 추가된 사용자인지 확인
  if (editingEditors.includes(email)) {
    showSnackbar('이미 추가된 사용자입니다.');
    return;
  }
  
  // viewer 목록에서 제거 (editor가 더 높은 권한)
  editingViewers = editingViewers.filter(v => v !== email);
  
  editingEditors = [...editingEditors, email];
  newEditorEmail = '';
  showSnackbar('편집 권한이 추가되었습니다.');
}

function removeEditor(email: string) {
  editingEditors = editingEditors.filter(e => e !== email);
}

function addViewer() {
  const email = newViewerEmail.trim();
  if (!email) {
    showSnackbar('이메일 주소를 입력해주세요.');
    return;
  }
  
  // 이메일 형식 검증 (간단한 검증)
  if (!email.includes('@')) {
    showSnackbar('올바른 이메일 주소를 입력해주세요.');
    return;
  }
  
  // 이미 추가된 사용자인지 확인
  if (editingViewers.includes(email) || editingEditors.includes(email)) {
    showSnackbar('이미 추가된 사용자입니다.');
    return;
  }
  
  editingViewers = [...editingViewers, email];
  newViewerEmail = '';
  showSnackbar('보기 권한이 추가되었습니다.');
}

function removeViewer(email: string) {
  editingViewers = editingViewers.filter(v => v !== email);
}

async function savePermissions() {
  if (!canManagePermissions(model, userID)) {
    showSnackbar('권한 관리 권한이 없습니다.');
    return;
  }
  
  try {
    // route-meta만 업데이트 (권한 정보는 메타데이터)
    await updateRouteMeta(data.id, {
      isPublic: editingIsPublic,
      editors: editingEditors,
      viewers: editingViewers,
    });
    
    // 로컬 모델 업데이트
    model.isPublic = editingIsPublic;
    model.editors = editingEditors;
    model.viewers = editingViewers;
    
    showSnackbar('권한이 저장되었습니다.');
    isOpenPermissionDialog = false;
  } catch (error) {
    console.error('Save permissions error:', error);
    showSnackbar('권한 저장에 실패했습니다.');
  }
}

function submitImportURL() {
  const prefix = 'https://map.naver.com/p/directions/';
  if (importURL.length === 0 || !importURL.startsWith(prefix)) {
    showSnackbar('URL이 유호하지 않습니다. 단축URL은 지원되지 않습니다');
    return;
  }
  const path = importURL.slice(prefix.length);
  const segments = path.split('/');
  if (segments.length < 2) {
    showSnackbar('URL이 유호하지 않습니다.');
    return;
  }
  const start = getPointFromSegments(segments[0]);
  if (start === null) {
    showSnackbar('출발지 정보가 유효하지 않습니다.');
    return;
  }
  const end = getPointFromSegments(segments[1]);
  if (end === null) {
    showSnackbar('도착지 정보가 유호하지 않습니다.');
    return;
  }

  const lastPoint = getLastPoint();
  if (start != null && (lastPoint == null || !getIsSamePoint(start, lastPoint))) {
    pushPoint(start);
  }
  const waypointPath = segments[2];
  if (waypointPath != '-') {
    const waypointSegments = waypointPath.split(':');
    if (waypointSegments.length > 0) {
      for (const waypointSegment of waypointSegments) {
        const point = getPointFromSegments(waypointSegment);
        if (point != null) {
          pushPoint(point);
        }
      }
    }
  }
  
  if (end != null) {
    pushPoint(end);
  }

  showAllPoints();
}

function getPointFromSegments(path: string): Point | undefined {
  const segments = path.split(',');
  if (segments.length < 2) {
    return;
  }
  const x = parseFloat(segments[0]);
  const y = parseFloat(segments[1]);
  const epsg4236 = naver.maps.TransCoord.fromEPSG3857ToLatLng({ x, y } as naver.maps.Point);
  let point = { lat: epsg4236.y, lng: epsg4236.x } as Point;
  if (segments.length > 2) {
    point.title = decodeURIComponent(segments[2]);
  }
  return point;
}

function editPoint(index: number) {
  const { title, lat, lng } = points[index];
  const epsg3857 = naver.maps.TransCoord.fromLatLngToEPSG3857({ x: lng, y: lat } as naver.maps.Coord);
  editingPointIndex = index;
  editingPointTitle = title ?? '';
  editingPointLat = lat;
  editingPointLng = lng;
  editingPointX = epsg3857.x;
  editingPointY = epsg3857.y;
  isOpenPointEditDialog = true;
}

function startEdit() {
  // 편집 권한이 없으면 편집 모드로 전환하지 않음
  if (!canEdit(model, userID)) {
    showSnackbar('편집 권한이 없습니다.');
    headerOpen = true; // 권한은 없지만 header는 열 수 있도록
    return;
  }
  editMode = true;
  headerOpen = true;
  resetEditData();
  // 편집 시작 시 초기 상태 저장
  saveInitialState();
}

async function saveEdit() {
  if (await saveRouteModel()) {
    // 저장 후 model을 업데이트하여 최신 데이터 반영
    model.title = title;
    model.executedDate = executedDate || undefined;
    // year는 saveRouteModel에서 이미 계산됨
    
    // 저장 후 초기 상태를 현재 상태로 업데이트 (변경 감지 리셋)
    saveInitialState();
    
    // 편집 모드는 유지 (저장 후에도 계속 편집 가능)
    showSnackbar('저장되었습니다.');
  }
}

function cancelEdit() {
  if (hasChanges()) {
    // 변경 사항이 있으면 확인 다이얼로그 표시
    isOpenCancelDialog = true;
  } else {
    // 변경 사항이 없으면 바로 취소 (실제로는 할 일이 없음)
    resetEditData();
  }
}

function confirmCancelEdit() {
  // 변경 사항이 있으면 초기 상태로 복원
  if (hasChanges()) {
    restoreInitialState();
  }
  // editMode는 유지 (취소해도 편집 모드 계속 유지)
  // header는 닫지 않음 (보기 전용에서도 header 열 수 있도록)
  resetEditData();
  isOpenCancelDialog = false;
}

function toggleEdit() {
  if (editMode) {
    cancelEdit()
  } else {
    startEdit()
  }
}

function toggleHeader() {
  headerOpen = !headerOpen;
  // header가 열릴 때 편집 가능하면 편집 모드로 전환
  if (headerOpen && canEdit(model, userID) && !editMode) {
    startEdit();
  }
  // header가 닫힐 때 편집 모드 해제
  if (!headerOpen && editMode) {
    cancelEdit();
  }
}

function resetEditData() {
  selectedPointIndex = -1;
  editingPointIndex = -1;
  editingPointTitle = '';
  editingPointLat = 0;
  editingPointLng = 0;
  editingPointX = 0;
  editingPointY = 0;
}

// 초기 상태 저장
function saveInitialState() {
  initialTitle = title;
  initialExecutedDate = executedDate;
  initialPoints = JSON.parse(JSON.stringify(points));
  initialSplit = [...split];
  initialPaths = paths.map(path => [...path]);
  initialLinks = [...links];
}

// 변경 사항 감지
function hasChanges(): boolean {
  // title 비교
  if (title !== initialTitle) return true;
  
  // executedDate 비교
  if (executedDate !== initialExecutedDate) return true;
  
  // points 비교
  if (points.length !== initialPoints.length) return true;
  for (let i = 0; i < points.length; i++) {
    if (points[i].title !== initialPoints[i]?.title ||
        Math.abs(points[i].lat - initialPoints[i]?.lat || 0) > 0.000001 ||
        Math.abs(points[i].lng - initialPoints[i]?.lng || 0) > 0.000001) {
      return true;
    }
  }
  
  // split 비교
  if (split.length !== initialSplit.length) return true;
  for (let i = 0; i < split.length; i++) {
    if (split[i] !== initialSplit[i]) return true;
  }
  
  // paths 비교
  if (paths.length !== initialPaths.length) return true;
  for (let i = 0; i < paths.length; i++) {
    if (paths[i].length !== initialPaths[i]?.length) return true;
    for (let j = 0; j < paths[i].length; j++) {
      if (Math.abs(paths[i][j] - (initialPaths[i]?.[j] || 0)) > 0.000001) {
        return true;
      }
    }
  }
  
  // links 비교
  if (links.length !== initialLinks.length) return true;
  for (let i = 0; i < links.length; i++) {
    if (links[i] !== initialLinks[i]) return true;
  }
  
  return false;
}

// 초기 상태로 복원
function restoreInitialState() {
  title = initialTitle;
  executedDate = initialExecutedDate;
  
  // points 복원
  points = JSON.parse(JSON.stringify(initialPoints));
  // markers 재생성 (applyPoints와 동일한 로직)
  markers.forEach(marker => marker.setMap(null));
  markers = [];
  applyPoints(initialPoints);
  
  // split 복원
  split = [...initialSplit];
  
  // paths 복원
  paths = initialPaths.map(path => [...path]);
  drawPath(paths.map(point => new naver.maps.LatLng(point[1], point[0])));
  
  // links 복원
  links = [...initialLinks];
  
  selectedPointIndex = -1;
}

function completeEditing() {
  if (editingPointIndex < 0) {
    return;
  }
  const origin = points[editingPointIndex];
  const isSetPoint = origin.lat != editingPointLat || origin.lng != editingPointLng;
  if (
    !isSetPoint &&
    origin.title === editingPointTitle
  ) {
    return;
  }
  setPoint(editingPointIndex, editingPointLat, editingPointLng, editingPointTitle);
  if (isSetPoint) {
    goPoint({ lat: editingPointLat, lng: editingPointLng } as Point);
  }
}

function moveSelectedPointUp() {
  if (selectedPointIndex < 1) {
    return;
  }

  const point = points[selectedPointIndex];
  points.splice(selectedPointIndex, 1);
  points.splice(--selectedPointIndex, 0, point);
  applyPoints([...points], true);
}

function moveSelectedPointDown() {
  if (selectedPointIndex < 0 || (selectedPointIndex + 1) >= points.length) {
    return;
  }
  
  const point = points[selectedPointIndex];
  points.splice(selectedPointIndex, 1);
  points.splice(++selectedPointIndex, 0, point);
  applyPoints([...points], true);
}

function removeSelectedPoint() {
  if (selectedPointIndex < 0 || selectedPointIndex >= points.length) {
    showSnackbar('삭제할 포인트를 선택해주세요');
    return;
  }

  points.splice(selectedPointIndex, 1);
  applyPoints([...points], true);
  selectedPointIndex = -1;
}

function removeAlldPoint() {
  applyPoints([], true);
  selectedPointIndex = -1;
}

function setPoint(index: number, lat: number, lng: number, title?: string) {
  if (!!title) {
    points[index].title = title;
  }
  points[index].lat = lat;
  points[index].lng = lng;
  markers[index].setPosition(points[index]);
  applyPoints(points, true);
}

function showAllPoints() {
  if (points.length === 0) {
    // points가 없는 경우 기본 줌 레벨로 설정
    const defaultCenter = new naver.maps.LatLng(37.5666805, 126.9784147);
    map.setCenter(defaultCenter);
    map.setZoom(10);
    return;
  }
  
  let min = points.reduce((point, current) => {
    return { lat: Math.min(point.lat, current.lat), lng: Math.min(point.lng, current.lng) } as Point;
  }, { lat: Number.MAX_SAFE_INTEGER, lng: Number.MAX_SAFE_INTEGER } as Point);
  let max = points.reduce((point, current) => {
    return { lat: Math.max(point.lat, current.lat), lng: Math.max(point.lng, current.lng) } as Point;
  }, { lat: 0, lng: 0 } as Point);
  const bounds = new naver.maps.LatLngBounds(
    new naver.maps.LatLng(min.lat, min.lng),
    new naver.maps.LatLng(max.lat, max.lng)
  );
  map.panToBounds(bounds);
}

function selectPoint(index: number) {
  if (index < 0 || index >= points.length) {
    return;
  }
  const point = points[index];
  goPoint(point);
  if (!editMode) {
    return;
  }
  selectedPointIndex = index;
}

function toggleSplit(index: number) {
  if (index === 0) {
    showSnackbar('출발지입니다');
    return;
  }
  if ((index + 1) === points.length) {
    showSnackbar('목적지입니다');
    return;
  }

  const splitIndex = split.indexOf(index);
  if (splitIndex < 0) {
    let i: number;
    for (i = 0; i < split.length; ++i) {
      if (index < split[i]) {
        break;
      }
    }
    split.splice(i, 0, index);
  } else {
    const previousIndex = split[splitIndex - 1];
    const nextIndex = split[splitIndex + 1];
    if ((nextIndex - previousIndex) > maxPoints) {
      showSnackbar(`경유지 간격은 최대 ${maxPoints - 1}개를 넘을 수 없습니다`);
      return;
    }
    split.splice(splitIndex, 1);
  }
  split = [...split];
}

function goPoint(point: Point) {
  const coord = { x: point.lng, y: point.lat } as naver.maps.Coord;
  map.morph(coord, 15);
}

function addCurrentPoint() {
  const center = map.getCenter();
  addPoint({ lat: center.y, lng: center.x, title: getPointName() } as Point);
}

function pushPoint(point: Point) {
  addPoint(point, points.length);
}

function getLastPoint(): Point | undefined {
  const lastIndex = points.length - 1;
  if (lastIndex < 0) {
    return;
  }
  return points[lastIndex];
}

function getIsSamePoint(lfs: Point, rfs: Point): boolean {
  return lfs.lat === rfs.lat && lfs.lng === rfs.lng;
}

function addPoint(point: Point, at?: number) {
  const length = points.length;
  const index = !!at ? (at <= length ? at : length) : (length > 1 ? length - 1 : length);
  let newPoints: Point[];
  if (length === 0) {
    newPoints = [point];
  } else {
    newPoints = [...points];
    newPoints.splice(index, 0, point);
  }
  applyPoints(newPoints, true);
  applySection();
  selectedPointIndex = index;
}

function applyPoints(newPoints: Point[], isModified: boolean = false) {
  points = newPoints;
  routeLine.setStyles('strokeOpacity', isModified ? 0.5 : 1);
  syncMarker();
}

function applySection() {
  const lastIndex = split.length - 1;
  const last = lastIndex < 0 ? 0 : split[lastIndex];
  const count = points.length - last;
  if (count > maxPoints) {
    split.push(last + maxPoints);
  }
}

function syncMarker() {
  points.forEach((point, index) => {
    const position = { x: point.lng, y: point.lat } as naver.maps.Coord;
    const content = `<div class="marker">${getMarkerLabel(index, points.length)}</div>`;
    const size = new naver.maps.Size(30, 30);
    const anchor = new naver.maps.Point(15, 15);
    const icon = { content, size, anchor };
    if (index < markers.length) {
      markers[index].setOptions({ position, icon });
    } else {
      markers.push(new naver.maps.Marker({ position, map, icon }));
    }
  });
  if (points.length < markers.length) {
    for (let i = points.length; i < markers.length; ++i) {
      markers[i].setMap(null);
    }
    markers.length = points.length;
  }
}

function getPointName() {
  const index = points.length;
  switch (index) {
    case 0:
      return '출발';
    case 1:
      return '도착';
    default:
      return `경유${index - 1}`;
  }
}

function getMarkerLabel(index: number, length: number): string {
  return String(index + 1);
}

async function handleLoadDirections() {
  if (points.length < 2) {
    showSnackbar('두개 이상의 포인트가 필요해요');
    drawPath([]);
    return;
  }

  // 서비스를 통해 경로 가져오기
  const newPaths = await loadAllDirections(points, split, { option: 'traavoidcaronly' });

  if (newPaths.length === 0) {
    showSnackbar('경로를 불러오는데 실패했습니다');
    drawPath([]);
    return;
  }

  paths = newPaths;
  drawPath(newPaths.map(point => (new naver.maps.LatLng(point[1], point[0]))));
}

function makeAllLinks() {
  let first = 0;
  let i = 0;
  links = [];
  for (i = 0; i < split.length; ++i) {
    const last = split[i];
    const link = makeLink(points.slice(first, last + 1));
    links[i] = link;
    first = last;
  }
  const last = points.length - 1;
  if (first < last) {
    const link = makeLink(points.slice(first, last + 1));
    links[i] = link;
  }
}

function makeLink(points: Point[]): string | null {
  if (points.length < 1) {
    return null;
  }
  
  let buffer = 'https://map.naver.com/p/directions/';
  let waypoints = [...points];
  const start = waypoints.shift()!;
  const end = waypoints.pop()!;
  const startCoord = convertPoint(start);
  const endCoord = convertPoint(end);
  buffer += `${startCoord.x},${startCoord.y},${start.title}/${endCoord.x},${endCoord.y},${end.title}/`;
  if (waypoints.length > 0) {
    buffer += waypoints.map(point => {
      const coord = convertPoint(point);
      return `${coord.x},${coord.y},${point.title}`;
    }).join(':');
  } else {
    buffer += '-';
  }
  buffer += '/car';
  return buffer;
}

async function copyToClipboard(link: string | null) {
  if (typeof link != 'string') {
    showSnackbar('링크에 문제가 있어요!');
    return;
  }
  try {
    await navigator.clipboard.writeText(link);
    showSnackbar('링크가 복사됐어요!');
  } catch (err) {
    showSnackbar('링크 복사에 실패했어요!');
  }
}

function convertPoint(point: Point) {
  return naver.maps.TransCoord.fromLatLngToEPSG3857({ x: point.lng, y: point.lat } as naver.maps.Coord);
}

function applyEditingPoint() {
  const epsg3857 = naver.maps.TransCoord.fromLatLngToEPSG3857({ x: editingPointLng, y: editingPointLat } as naver.maps.Coord);
  editingPointX = epsg3857.x;
  editingPointY = epsg3857.y;
}

function applyEditingPointEPSG4236() {
  const epsg4236 = naver.maps.TransCoord.fromEPSG3857ToLatLng({ x: editingPointX, y: editingPointY } as naver.maps.Point);
  editingPointLat = epsg4236.y;
  editingPointLng = epsg4236.x;
}

function initMap() {
  const initialPoint = new naver.maps.LatLng(37.5666805, 126.9784147);
  const center: naver.maps.LatLng = initialPoint;

  map = new naver.maps.Map('map', {
      center: center,
      zoom: 10
  });

  naver.maps.Event.addListener(map, 'click', function(e) {
    if (selectedPointIndex < 0) {
      return;
    }

    const point = e.coord;
    setPoint(selectedPointIndex, point.y, point.x);
  });

  routeLine = new naver.maps.Polyline({
      map: map,
      path: [],
      strokeColor: '#536f93',
      strokeWeight: 3
  });
}

onMount(async () => {
	const user: any = await data.getAuthUser();
  userID = user.uid;
  
  // 먼저 지도를 초기화하여 routeLine을 생성
  initMap();
  
  // 그 다음 모델을 로드
  await loadRouteModel();
  
  // 새로 만들어진 경로인 경우 편집 모드로 시작
  if ($page.url.searchParams.get('new') === 'true') {
    startEdit();
    // DOM 업데이트 후 제목 필드에 포커스
    await tick();
    if (titleFieldElement) {
      const input = titleFieldElement.querySelector('input');
      if (input) {
        input.focus();
      }
    }
  }
});

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
  background-color: #fff;
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
  box-shadow:
    0px 3px 5px -1px rgba(0, 0, 0, 0.2),
    0px 5px 8px 0px rgba(0, 0, 0, 0.14),
    0px 1px 14px 0px rgba(0, 0, 0, 0.12);
}

nav {
  padding: 5px 10px;
  z-index: 9;
}

header.open nav {
  background-color: #fff;
}

:global(nav .nav-btn) {
  margin-top: 5px;
  margin-bottom: 5px;
}

.bottom {
  position: absolute;
  box-sizing: border-box;
  bottom: 0;
  right: 0;
  width: 400px;
  background-color: #fff;
}

.bottom .date-action,
.bottom .point-action,
.bottom .route-action {
  padding: 10px;
  border-top: #eee 1px solid;
}

.bottom .point-action {
  text-align: center;
}

.bottom .route-action {
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

:global(.bottom .route-action > button) {
  vertical-align: middle;
}

.bottom .route-action .tooltip-wrapper {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

/* 툴팁 스타일 - wrapper를 사용하여 버튼에 영향 없이 표시 */
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

/* 커스텀 툴팁 - absolute positioning으로 버튼 레이아웃에 영향 없음 */
.tooltip-wrapper:hover::after {
  content: attr(title);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 10px;
  background-color: rgba(0, 0, 0, 0.87);
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  border-radius: 4px;
  pointer-events: none;
  z-index: 10000;
  opacity: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 오른쪽 정렬 툴팁 - 컨테이너 안에 완전히 들어오도록 조정 */
.tooltip-wrapper.tooltip-right-align:hover::after {
  left: auto;
  left: 0;
  transform: none;
  /* 툴팁이 컨테이너를 넘지 않도록 */
  max-width: 350px;
  word-wrap: break-word;
}

.tooltip-wrapper.tooltip-right-align:hover::before {
  left: auto;
  right: 20px;
  transform: none;
}

/* 툴팁 화살표 */
.tooltip-wrapper:hover::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.87);
  pointer-events: none;
  z-index: 10001;
}

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

ul.menu > li.selected {
  border: 1px #ccc solid;
  border-radius: 5px;
}

ul.menu > li > button {
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  height: 40px;
  margin-right: 5px;
  padding: 0;
  border: none;
  border-radius: 20px;
  background-color: #000;
  cursor: pointer;
  color: #fff;
  font-size: 11px;
  line-height: 40px;
  text-align: left;
  vertical-align: middle;
}

ul.menu span.seq {
  display: inline-block;
  width: 40px;
  height: 40px;
  text-align: center;
  vertical-align: top;
}

ul.menu span.title {
  display: inline-block;
  overflow: hidden;
  max-width: 300px;
  text-align: left;
  height: 40px;
  padding-right: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

ul.menu > li > button.icon {
  padding: 8px;
}

/* header가 닫혔을 때 editPoint와 toggleSplit 버튼 숨김 */
header:not(.open) ul.menu > li > button.icon {
  display: none;
}

ul.menu > li:first-of-type {
  z-index: 9;
}

main {
  position: relative;
  display: block;
  flex: 1 1 auto;
}

#map {
  position: absolute !important;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.title-layer {
  position: absolute;
  z-index: 10;
  box-sizing: border-box;
  top: 10px;
  left: 80px;
  min-height: 56px;
  user-select: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:global(.title-layer > label) {
  width: 300px;
}

:global(.point-item .node) {
  vertical-align: middle;
}

:global(.point-item > button, .point-item .mdc-radio) {
  vertical-align: middle;
  margin-right: 5px;
}

.editing-text,
.editing-point {
  padding: 10px;
}

:global(.editing-text > label) {
  width: 100%;
}

.editing-point {
  padding: 10px;
}

:global(.editing-point > label) {
  margin: 0 10px;
}

ul.link-box {
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 5px;
  user-select: none;
}

ul.link-box > li {
  padding: 5px 10px;
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

/* 권한 관리 Dialog 스타일 */
:global(.permission-dialog .mdc-dialog__surface) {
  max-width: 600px;
  width: 90%;
}

.permission-section {
  margin-bottom: 24px;
}

.permission-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.hint {
  font-size: 12px;
  color: #666;
  margin: 8px 0 0 0;
}

.user-input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 12px;
}


</style>
