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
import { responseService } from '@/services/responseService';

import { Scrollbar } from '@/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { TableEmptyRows } from '../table-empty-rows';
import { ResponseTableHead } from '../response-table-head';
import { ResponseTableToolbar } from '../response-table-toolbar';
import { ResponseTableRow } from '../response-table-row';
import { ResponseDetailModal } from '../components/response-detail-modal';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { Response } from '@/types/api';
import type { ResponseProps } from '../response-table-row';

// ----------------------------------------------------------------------

const DEFAULT_PERIOD = '전체';

const mapResponseToRow = (response: Response): ResponseProps => ({ ...response });

export function ResponseView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  const [filterPeriod, setFilterPeriod] = useState(DEFAULT_PERIOD);
  const [responses, setResponses] = useState<ResponseProps[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<ResponseProps | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchResponses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await responseService.getResponses({ page: 1, limit: 200 });
        if (!isMounted) return;

        const mapped = result.data.map((item) => mapResponseToRow(item));
        setResponses(mapped);
        table.onResetPage();
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : '응답 데이터를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchResponses();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dataFiltered: ResponseProps[] = applyFilter({
    inputData: responses,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    filterPeriod,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !isLoading && !dataFiltered.length && (filterName !== '' || filterPeriod !== DEFAULT_PERIOD);

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

  const handleRowClick = useCallback((response: ResponseProps) => {
    setSelectedResponse(response);
    setDetailModalOpen(true);
  }, []);

  const handleDetailModalClose = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedResponse(null);
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
          응답 관리
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <ResponseTableToolbar
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
              <ResponseTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={responses.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    responses.map((item) => item.id)
                  )
                }
                headLabel={[
                  { id: 'userName', label: '이용자' },
                  { id: 'submittedAt', label: '응답 일시' },
                  { id: 'responseSummary', label: '응답 요약' },
                  { id: 'status', label: '응답 상태' },
                ]}
              />

              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  dataInPage.map((row) => (
                    <ResponseTableRow
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

      <ResponseDetailModal
        open={detailModalOpen}
        onClose={handleDetailModalClose}
        response={selectedResponse}
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
