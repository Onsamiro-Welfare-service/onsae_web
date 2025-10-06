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
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
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
      response.userName.toLowerCase().includes(keyword) ||
      response.userCode.toLowerCase().includes(keyword) ||
      response.questionTitle.toLowerCase().includes(keyword) ||
      response.responseText.toLowerCase().includes(keyword)
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

    inputData = inputData.filter((response) => parseDate(response.submittedAt) >= filterDate);
  }

  return inputData;
}

