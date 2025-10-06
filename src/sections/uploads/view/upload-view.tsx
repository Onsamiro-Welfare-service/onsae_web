import { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { DashboardContent } from '@/layouts/dashboard';
import { uploadService } from '@/services/uploadService';

import { Scrollbar } from '@/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { TableEmptyRows } from '../table-empty-rows';
import { UploadTableHead } from '../upload-table-head';
import { UploadTableToolbar } from '../upload-table-toolbar';
import { UploadTableRow } from '../upload-table-row';
import { UploadDetailModal } from '../components/upload-detail-modal';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { UploadRecord } from '@/types/api';
import type { UploadRow } from '../upload-table-row';

// ----------------------------------------------------------------------

const DEFAULT_PERIOD = '전체';

const mapUploadToRow = (upload: UploadRecord): UploadRow => ({
  ...upload,
  uploadType: upload.id.includes('photo') ? '사진 업로드' : '문서 업로드',
});

export function UploadView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  const [filterPeriod, setFilterPeriod] = useState(DEFAULT_PERIOD);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<UploadRow | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUploads = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await uploadService.getUploads({ page: 1, limit: 200 });
        if (!isMounted) return;

        const mapped = result.data.map((item) => mapUploadToRow(item));
        setUploads(mapped);
        table.onResetPage();
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : '업로드 데이터를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUploads();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dataFiltered: UploadRow[] = applyFilter({
    inputData: uploads,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    filterPeriod,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound =
    !isLoading &&
    !dataFiltered.length &&
    (filterName.trim() !== '' || filterPeriod !== DEFAULT_PERIOD);

  const handleFilterName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFilterName(event.target.value);
      table.onResetPage();
    },
    [table]
  );

  const handleFilterPeriod = useCallback(
    (period: string) => {
      setFilterPeriod(period);
      table.onResetPage();
    },
    [table]
  );

  const handleRowClick = useCallback((response: UploadRow) => {
    setSelectedUpload(response);
    setDetailModalOpen(true);
  }, []);

  const handleDetailModalClose = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedUpload(null);
  }, []);

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          업로드 관리
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <UploadTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          filterPeriod={filterPeriod}
          onFilterName={handleFilterName}
          onFilterPeriod={handleFilterPeriod}
        />

        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {error}
          </Alert>
        )}

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UploadTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={uploads.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    uploads.map((item) => item.id)
                  )
                }
                headLabel={[
                  { id: 'uploadType', label: '자료 구분' },
                  { id: 'userName', label: '이용자' },
                  { id: 'submittedAt', label: '업로드 일시' },
                  { id: 'responseSummary', label: '내용 요약' },
                  { id: 'status', label: '처리 상태' },
                ]}
              />

              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  dataInPage.map((row) => (
                    <UploadTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onRowClick={() => handleRowClick(row)}
                    />
                  ))}

                <TableEmptyRows
                  height={table.dense ? 52 : 72}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>

      <UploadDetailModal
        open={detailModalOpen}
        onClose={handleDetailModalClose}
        response={selectedUpload}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('submittedAt');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [dense, setDense] = useState(false);

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  const onChangeDense = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  }, []);

  return {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    selected,
    onSort,
    onSelectAllRows,
    onSelectRow,
    onResetPage,
    onChangePage,
    onChangeRowsPerPage,
    onChangeDense,
  };
}






