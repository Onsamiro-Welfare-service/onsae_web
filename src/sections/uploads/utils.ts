import type { UploadRow } from './upload-table-row';

// ----------------------------------------------------------------------

export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

// ----------------------------------------------------------------------

export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

// ----------------------------------------------------------------------

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];

  // null이나 undefined 처리
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;

  // 날짜 문자열인 경우 Date 객체로 변환하여 비교
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    const aDate = new Date(aValue);
    const bDate = new Date(bValue);
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      if (bDate < aDate) return -1;
      if (bDate > aDate) return 1;
      return 0;
    }
  }

  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

export function getComparator<Key extends keyof any>(
  order: 'asc' | 'desc',
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: UploadRow[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  filterPeriod: string;
};

const PERIOD_ALL = '전체';
const PERIOD_TODAY = '오늘';
const PERIOD_WEEK = '일주일';
const PERIOD_MONTH = '한 달';

const parseDate = (value: string) => new Date(value.replace(' ', 'T'));

export function applyFilter({ inputData, comparator, filterName, filterPeriod }: ApplyFilterProps) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    const keyword = filterName.toLowerCase().trim();
    inputData = inputData.filter((response) =>
      (response.user_name?.toLowerCase() || '').includes(keyword) ||
      (response.title?.toLowerCase() || '').includes(keyword) ||
      (response.content_preview?.toLowerCase() || '').includes(keyword)
    );
  }

  if (filterPeriod !== PERIOD_ALL) {
    const today = new Date();
    const filterDate = new Date(today);

    switch (filterPeriod) {
      case PERIOD_TODAY:
        filterDate.setHours(0, 0, 0, 0);
        break;
      case PERIOD_WEEK:
        filterDate.setDate(today.getDate() - 7);
        break;
      case PERIOD_MONTH:
        filterDate.setMonth(today.getMonth() - 1);
        break;
      default:
        break;
    }

    inputData = inputData.filter((response) => {
      if (!response.created_at) return false;
      const responseDate = new Date(response.created_at);
      return !isNaN(responseDate.getTime()) && responseDate >= filterDate;
    });
  }

  return inputData;
}

