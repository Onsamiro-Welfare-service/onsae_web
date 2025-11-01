import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { DashboardContent } from '@/layouts/dashboard';
import { Iconify } from '@/components/iconify';
import { questionAssignmentService, type QuestionAssignmentRecord } from '@/services/questionAssignmentService';
import { UnifiedAssignmentModal } from '../components/unified-assignment-modal';
import { AssignmentDetailModal } from '../components/assignment-detail-modal';

// ----------------------------------------------------------------------

export function AssignmentView() {
  const [assignments, setAssignments] = useState<QuestionAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [assigneeType, setAssigneeType] = useState<'all' | 'user' | 'group'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await questionAssignmentService.getAssignments();
      setAssignments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '질문 할당 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    // 검색 필터
    const matchesName = !filterName || 
      assignment.questionTitle.toLowerCase().includes(filterName.toLowerCase()) ||
      assignment.questionContent.toLowerCase().includes(filterName.toLowerCase()) ||
      assignment.userName?.toLowerCase().includes(filterName.toLowerCase()) ||
      assignment.groupName?.toLowerCase().includes(filterName.toLowerCase());
    
    // 할당 유형 필터
    const matchesType = assigneeType === 'all' ||
      (assigneeType === 'user' && assignment.userId !== null) ||
      (assigneeType === 'group' && assignment.groupId !== null);
    
    return matchesName && matchesType;
  });

  const paginatedAssignments = filteredAssignments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleViewDetail = (assignmentId: number) => {
    setSelectedAssignmentId(assignmentId);
    setDetailModalOpen(true);
  };

  const handleDetailClose = () => {
    setDetailModalOpen(false);
    setSelectedAssignmentId(null);
  };

  const handleDelete = async (assignmentId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // 상세 모달 열기 방지
    
    if (!confirm('정말로 이 할당을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await questionAssignmentService.deleteAssignment(assignmentId);
      await loadAssignments();
      alert('할당이 성공적으로 삭제되었습니다.');
    } catch {
      alert('할당 삭제에 실패했습니다.');
    }
  };

  const handleCategoryAssignComplete = () => {
    loadAssignments();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(paginatedAssignments.map((a) => a.id));
      return;
    }
    setSelected([]);
  };

  const handleSelectRow = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

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
          질문 할당 관리
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Toolbar
          sx={{
            height: { xs: 'auto', md: 96 },
            minHeight: { xs: 80, md: 96 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: { xs: 2, md: 2 },
            p: (theme) => theme.spacing(2, 3),
            bgcolor: '#ffffff',
            borderRadius: '12px 12px 0 0',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <OutlinedInput
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="질문, 사용자, 그룹으로 검색..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
              </InputAdornment>
            }
            sx={{
              flex: { xs: 'none', sm: 1 },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '100%', sm: 320 },
              minWidth: { xs: '100%', sm: 200 },
              height: 48,
              bgcolor: '#fafafa',
              borderRadius: 2,
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>할당 유형</InputLabel>
              <Select
                value={assigneeType}
                label="할당 유형"
                onChange={(e) => setAssigneeType(e.target.value as 'all' | 'user' | 'group')}
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="user">사용자별</MenuItem>
                <MenuItem value="group">그룹별</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={() => setCategoryModalOpen(true)}
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{ height: 40 }}
            >
              질문 할당
            </Button>
          </Box>
        </Toolbar>

        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < paginatedAssignments.length}
                    checked={paginatedAssignments.length > 0 && selected.length === paginatedAssignments.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, px: 2 }}>우선순위</TableCell>
                <TableCell sx={{ fontWeight: 600, px: 2 }}>질문 제목</TableCell>
                <TableCell sx={{ fontWeight: 600, px: 2 }}>할당 대상</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', px: 2 }}>응답 수</TableCell>
                <TableCell sx={{ fontWeight: 600, px: 2 }}>할당일</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', px: 2 }}>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              )}

              {!loading && paginatedAssignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      할당된 질문이 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                paginatedAssignments.map((assignment) => (
                  <TableRow 
                    key={assignment.id} 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleViewDetail(assignment.id)}
                  >
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.includes(assignment.id)}
                        onChange={() => handleSelectRow(assignment.id)}
                      />
                    </TableCell>
                    <TableCell sx={{ px: 2 }}>
                      <Chip
                        label={assignment.priority}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ px: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {assignment.questionTitle}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {assignment.questionContent}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ px: 2 }}>
                      {assignment.userId ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Iconify icon="eva:person-fill" sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {assignment.userName}
                          </Typography>
                          <Chip label="사용자" size="small" variant="outlined" color="primary" />
                        </Box>
                      ) : assignment.groupId ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Iconify icon="solar:users-group-rounded-bold" sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2">
                            {assignment.groupName}
                          </Typography>
                          <Chip label="그룹" size="small" variant="outlined" color="success" />
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', px: 2 }}>
                      <Chip
                        label={assignment.responseCount}
                        size="small"
                        color={assignment.responseCount > 0 ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ px: 2 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </Typography>
                      {assignment.assignedByName && (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          by {assignment.assignedByName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', px: 2 }} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="삭제">
                        <IconButton
                          size="small"
                          onClick={(e) => handleDelete(assignment.id, e)}
                          sx={{ color: 'error.main' }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredAssignments.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>

      <UnifiedAssignmentModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onComplete={handleCategoryAssignComplete}
      />

      <AssignmentDetailModal
        open={detailModalOpen}
        onClose={handleDetailClose}
        assignmentId={selectedAssignmentId}
        onUpdate={loadAssignments}
      />
    </DashboardContent>
  );
}

