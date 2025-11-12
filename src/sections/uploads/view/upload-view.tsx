﻿import { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';

import { DashboardContent } from '@/layouts/dashboard';
import { uploadService } from '@/services/uploadService';

import { TableNoData } from '../table-no-data';
import { TableEmptyRows } from '../table-empty-rows';
import { UploadTableHead } from '../upload-table-head';
import { UploadTableToolbar } from '../upload-table-toolbar';
import { UploadTableRow } from '../upload-table-row';
import { UploadDetailModal } from '../components/upload-detail-modal';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { UploadRow } from '../upload-table-row';

// ----------------------------------------------------------------------

const DEFAULT_PERIOD = '전체';

export function UploadView() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

        const result = await uploadService.getUploads();
        if (!isMounted) return;

        setUploads(result);
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

  // URL 파라미터에서 uploadId를 읽어서 모달 열기
  useEffect(() => {
    const uploadIdParam = searchParams.get('uploadId');
    if (uploadIdParam && uploads.length > 0) {
      const uploadId = parseInt(uploadIdParam, 10);
      if (!isNaN(uploadId)) {
        const upload = uploads.find((u) => u.id === uploadId);
        if (upload) {
          setSelectedUpload(upload);
          setDetailModalOpen(true);
          // URL에서 파라미터 제거 (뒤로가기 시 모달이 다시 열리지 않도록)
          router.replace('/uploads');
        }
      }
    }
  }, [searchParams, uploads, router]);

  const comparator: (a: any, b: any) => number = table.sortEnabled
    ? getComparator(table.order, table.orderBy)
    : (() => 0);

  const dataFiltered: UploadRow[] = applyFilter({
    inputData: uploads,
    comparator,
    filterName,
    filterPeriod,
  });

  const notFound = !dataFiltered.length && (!!filterName || filterPeriod !== DEFAULT_PERIOD);

  const displayedUploads = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

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
    // URL에서 uploadId 파라미터 제거
    if (searchParams.get('uploadId')) {
      router.replace('/uploads');
    }
  }, [searchParams, router]);

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
          메시지 관리
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(255,255,255,0.72)',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

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
      
        <TableContainer sx={{ overflowX: 'auto', overflowY: 'unset' }}>
          <Table sx={{ minWidth: 800 }}>
            <UploadTableHead
              order={table.order}
              orderBy={table.orderBy}
              rowCount={dataFiltered.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((item) => String(item.id))
                )
              }
              headLabel={[
                { id: 'userName', label: '이용자' },
                { id: 'createdAt', label: '업로드 일시' },
                { id: 'contentPreview', label: '내용 요약' },
                { id: 'adminRead', label: '처리 상태' },
              ]}
            />
            <TableBody>
              {displayedUploads.map((row) => (
                <UploadTableRow
                  key={row.id}
                  row={row}
                  selected={table.selected.includes(String(row.id))}
                  onSelectRow={() => table.onSelectRow(String(row.id))}
                  onRowClick={() => handleRowClick(row)}
                />
              ))}

              <TableEmptyRows
                height={68}
                emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
              />

              {notFound && <TableNoData searchQuery={filterName} />}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            bgcolor: '#ffffff',
            borderTop: '1px solid #e6e6e6',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            총 {dataFiltered.length}건 중 {dataFiltered.length === 0 ? 0 : table.page * table.rowsPerPage + 1}-
            {Math.min((table.page + 1) * table.rowsPerPage, dataFiltered.length)}건 표시
          </Typography>

          <TablePagination
            component="div"
            page={table.page}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            labelRowsPerPage="페이지당 행 수:"
          />
        </Box>
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
  const [orderBy, setOrderBy] = useState('createdAt');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [sortEnabled, setSortEnabled] = useState(false);

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
      setSortEnabled(true);
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

  return {
    page,
    order,
    onSort,
    orderBy,
    sortEnabled,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}






