/**
 * Naver Map Direction API 서비스
 * NCP Cloud Functions 또는 직접 API를 호출하여 경로 정보를 가져옵니다.
 */

// NCP Direction API 엔드포인트 설정
// 필요시 이 값들을 수정하여 다른 엔드포인트를 사용할 수 있습니다
const NCP_DIRECTION_API_HOST = 'cgf0g5fahf.apigw.ntruss.com';
const NCP_DIRECTION_API_PATH = '/direction5/v1/0nIvwzk5bm/json/';

export interface Point {
  lat: number;
  lng: number;
}

export interface DirectionOptions {
  option?: 'traavoidtoll' | 'traavoidcaronly' | 'trafast' | 'tracomfort' | 'traoptimal';
}

interface RouteData {
  path: number[][];
  summary?: {
    distance?: number;
    duration?: number;
  };
}

interface DirectionResponse {
  responseData: {
    code: number;
    message?: string;
    route?: {
      traavoidtoll?: RouteData[];
      traavoidcaronly?: RouteData[];
      trafast?: RouteData[];
      tracomfort?: RouteData[];
      traoptimal?: RouteData[];
    };
  };
}

/**
 * Direction API 호출을 위한 URL 생성
 */
function getDirectionApiUrl(): string {
  return `https://${NCP_DIRECTION_API_HOST}${NCP_DIRECTION_API_PATH}`;
}

/**
 * 포인트 배열로부터 경로 정보를 가져옵니다.
 * 
 * @param points - 경로를 구성할 포인트 배열 (최소 2개 필요)
 * @param options - 경로 옵션 (기본값: traavoidcaronly)
 * @returns 경로 좌표 배열 또는 null
 */
export async function loadDirection(
  points: Point[],
  options: DirectionOptions = {}
): Promise<number[][] | null> {
  if (points.length < 2) {
    console.warn('최소 2개의 포인트가 필요합니다.');
    return null;
  }

  const waypoints = [...points];
  const start = waypoints.shift()!;
  const end = waypoints.pop()!;
  const option = options.option || 'traavoidcaronly';

  // 쿼리 파라미터 구성 (xid, xkey 제거 - Cloud Functions에서 처리)
  const queryParams: string[] = [
    `start=${start.lng},${start.lat}`,
    `goal=${end.lng},${end.lat}`,
    `option=${option}`,
  ];

  // action 파라미터 추가 (경유지 개수에 따라 결정)
  const action = waypoints.length > 5 ? 'direction15' : 'direction5';
  queryParams.push(`action=${action}`);

  // 경유지가 있으면 추가
  if (waypoints.length > 0) {
    const waypointsStr = waypoints
      .map((point) => `${point.lng},${point.lat}`)
      .join('|');
    queryParams.push(`waypoints=${waypointsStr}`);
  }

  const apiUrl = getDirectionApiUrl();
  const url = `${apiUrl}?${queryParams.join('&')}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Direction API 호출 실패:', response.status, response.statusText);
      return null;
    }

    const data: DirectionResponse = await response.json();

    // 응답 검증
    if (data.responseData?.code !== 0) {
      console.error('Direction API 에러:', data.responseData?.message || 'Unknown error');
      return null;
    }

    // 옵션에 따른 경로 데이터 추출
    const routeData = data.responseData.route?.[option]?.[0];
    
    if (!routeData || !routeData.path) {
      console.error('경로 데이터를 찾을 수 없습니다.');
      return null;
    }

    return routeData.path;
  } catch (error) {
    console.error('Direction API 호출 중 오류 발생:', error);
    return null;
  }
}

/**
 * 여러 구간으로 나눈 포인트들의 경로를 모두 가져옵니다.
 * 
 * @param points - 전체 포인트 배열
 * @param splits - 구간을 나누는 인덱스 배열
 * @param options - 경로 옵션
 * @returns 결합된 경로 좌표 배열
 */
export async function loadAllDirections(
  points: Point[],
  splits: number[],
  options: DirectionOptions = {}
): Promise<number[][]> {
  if (points.length < 2) {
    console.warn('최소 2개의 포인트가 필요합니다.');
    return [];
  }

  let allPaths: number[][] = [];
  let firstIndex = 0;

  // 각 구간별로 경로 가져오기
  for (const splitIndex of splits) {
    const sectionPoints = points.slice(firstIndex, splitIndex + 1);
    const sectionPaths = await loadDirection(sectionPoints, options);
    
    if (sectionPaths) {
      allPaths = allPaths.concat(sectionPaths);
    }
    
    firstIndex = splitIndex;
  }

  // 마지막 구간 처리
  const lastIndex = points.length - 1;
  if (firstIndex < lastIndex) {
    const lastSectionPoints = points.slice(firstIndex, lastIndex + 1);
    const lastSectionPaths = await loadDirection(lastSectionPoints, options);
    
    if (lastSectionPaths) {
      allPaths = allPaths.concat(lastSectionPaths);
    }
  }

  return allPaths;
}

/**
 * Direction API URL을 반환합니다 (디버깅용)
 */
export function getApiEndpoint(): string {
  return getDirectionApiUrl();
}

