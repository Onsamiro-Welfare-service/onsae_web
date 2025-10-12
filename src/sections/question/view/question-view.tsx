
import { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent } from 'react';

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
import { questionService } from '@/services/questionService';

import { Scrollbar } from '@/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { TableEmptyRows } from '../table-empty-rows';
import { QuestionTableRow } from '../question-table-row';
import { QuestionTableHead } from '../question-table-head';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { QuestionTableToolbar } from '../question-table-toolbar';
import { QuestionAddModal } from '../components/question-add-modal';
import { QuestionDetailModal } from '../components/question-detail-modal';

import type { Question, CreateQuestionRequest } from '@/types/api';
import type { QuestionProps } from '../question-table-row';

// ----------------------------------------------------------------------

const PRIORITY_MAP: Record<string, QuestionProps['priority']> = {
  높음: '높음',
  중간: '중간',
  낮음: '낮음',
};

const mapQuestionToRow = (question: Question): QuestionProps => ({
  ...question,
  priority: PRIORITY_MAP[question.priority] ?? '중간',
});

export function QuestionView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionProps | null>(null);
  const [questions, setQuestions] = useState<QuestionProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await questionService.getQuestions({ page: 1, limit: 200 });
        if (!isMounted) return;

        const mapped = response.data.map(mapQuestionToRow);
        setQuestions(mapped);
        table.onResetPage();
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : '질문 데이터를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchQuestions();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dataFiltered: QuestionProps[] = applyFilter({
    inputData: questions,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const handleAddQuestion = useCallback(() => {
    setOpenAddModal(true);
  }, []);

  const handleViewQuestion = useCallback((question: QuestionProps) => {
    setSelectedQuestion(question);
    setOpenViewModal(true);
  }, []);

  const handleEditQuestion = useCallback((question: QuestionProps) => {
    // 편집 로직 구현
    console.log('Edit question:', question);
  }, []);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    // 삭제 로직 구현
    console.log('Delete question:', questionId);
  }, []);

  const handleSaveQuestion = useCallback(async (questionData: CreateQuestionRequest) => {
    const created = await questionService.createQuestion(questionData);
    setQuestions((prev) => [mapQuestionToRow(created), ...prev]);
    table.onResetPage();
  }, [setQuestions, table]);

  const displayedQuestions = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          질문 관리
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

        <QuestionTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          onAddQuestion={handleAddQuestion}
        />

        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {error}
          </Alert>
        )}

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <QuestionTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={questions.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    questions.map((question) => question.id)
                  )
                }
                headLabel={[
                  { id: 'title', label: '질문 제목' },
                  { id: 'category', label: '카테고리' },
                  { id: 'type', label: '타입' },
                  { id: 'priority', label: '우선순위' },
                  { id: 'status', label: '상태' },
                ]}
              />
              <TableBody>
                {displayedQuestions.map((row) => (
                  <QuestionTableRow
                    key={row.id}
                    row={row}
                    selected={table.selected.includes(row.id)}
                    onSelectRow={() => table.onSelectRow(row.id)}
                    onEditQuestion={handleEditQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                    onViewQuestion={handleViewQuestion}
                  />
                ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, questions.length)}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            bgcolor: '#ffffff',
            borderTop: '1px solid #e5e5e5',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            총 {questions.length}개 질문 중 {questions.length === 0 ? 0 : table.page * table.rowsPerPage + 1}
            -
            {Math.min((table.page + 1) * table.rowsPerPage, questions.length)}개 표시
          </Typography>

          <TablePagination
            component="div"
            page={table.page}
            count={questions.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            labelRowsPerPage="페이지당 행 수:"
          />
        </Box>
      </Card>

      <QuestionAddModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSave={handleSaveQuestion}
      />

      <QuestionDetailModal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        question={selectedQuestion}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('title');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

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

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onChangeRowsPerPage,
    onSelectAllRows,
  };
}







