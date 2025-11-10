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
import { groupService, type UserGroup } from '@/services/groupService';
import { UnifiedAssignmentModal } from '@/sections/question-assignments/components/unified-assignment-modal';

import { TableNoData } from '../table-no-data';
import { GroupTableRow, type GroupProps } from '../group-table-row';
import { GroupTableHead } from '../group-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { GroupTableToolbar } from '../group-table-toolbar';
import { GroupCreateModal } from '../components/group-create-modal';
import { GroupEditModal } from '../components/group-edit-modal';
import { GroupMembersModal } from '../components/group-members-modal';
import { GroupQuestionsModal } from '../components/group-questions-modal';
import { GroupManageModal } from '../components/group-manage-modal';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

const mapGroupToRow = (group: UserGroup): GroupProps => group;

export default function GroupsView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openMembersModal, setOpenMembersModal] = useState(false);
  const [openQuestionsModal, setOpenQuestionsModal] = useState(false);
  const [openManageModal, setOpenManageModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupProps | null>(null);
  const [groupToAssign, setGroupToAssign] = useState<GroupProps | null>(null);
  const [groups, setGroups] = useState<GroupProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await groupService.getGroups();
        if (!isMounted) return;
        setGroups(data.map(mapGroupToRow));
        table.onResetPage();
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : '그룹 데이터를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchGroups();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const comparator: (a: any, b: any) => number = table.sortEnabled
    ? getComparator(table.order, table.orderBy)
    : (() => 0);

  const dataFiltered: GroupProps[] = applyFilter({
    inputData: groups,
    comparator,
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const handleCreateGroup = useCallback(() => {
    setOpenCreateModal(true);
  }, []);

  const handleViewGroup = useCallback((group: GroupProps) => {
    setSelectedGroup(group);
    setOpenManageModal(true);
  }, []);

  const handleEditGroup = useCallback((group: GroupProps) => {
    setSelectedGroup(group);
    setOpenEditModal(true);
  }, []);

  const handleDeleteGroup = useCallback(async (groupId: number) => {
    if (!confirm('정말로 이 그룹을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await groupService.deleteGroup(groupId);
      const data = await groupService.getGroups();
      setGroups(data.map(mapGroupToRow));
      table.onResetPage();
      alert('그룹이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('그룹 삭제 실패:', error);
      alert('그룹 삭제에 실패했습니다.');
    }
  }, [table]);

  const handleViewMembers = useCallback((group: GroupProps) => {
    setSelectedGroup(group);
    setOpenMembersModal(true);
  }, []);

  const handleViewQuestions = useCallback((group: GroupProps) => {
    setSelectedGroup(group);
    setOpenQuestionsModal(true);
  }, []);

  const handleAssignQuestions = useCallback((group: GroupProps) => {
    setGroupToAssign(group);
    setOpenAssignModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setOpenCreateModal(false);
    setOpenEditModal(false);
    setOpenMembersModal(false);
    setOpenQuestionsModal(false);
    setOpenManageModal(false);
    setSelectedGroup(null);
    const fetchGroups = async () => {
      try {
        const data = await groupService.getGroups();
        setGroups(data.map(mapGroupToRow));
        table.onResetPage();
      } catch (err) {
        console.error('그룹 목록 로드 실패:', err);
      }
    };
    fetchGroups();
  }, [table]);

  const displayedGroups = dataFiltered.slice(
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
          그룹 관리
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

        <GroupTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          onAddGroup={handleCreateGroup}
        />

        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {error}
          </Alert>
        )}
      
        <TableContainer sx={{ overflowX: 'auto', overflowY: 'unset' }}>
          <Table sx={{ minWidth: 800 }}>
            <GroupTableHead
              order={table.order}
              orderBy={table.orderBy}
              rowCount={dataFiltered.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  groups.map((group) => String(group.id))
                )
              }
              headLabel={[
                { id: 'name', label: '그룹명' },
                { id: 'description', label: '설명' },
                { id: 'memberCount', label: '멤버 수' },
                { id: 'isActive', label: '상태' },
                { id: 'createdByName', label: '생성자' },
                { id: 'createdAt', label: '생성일' },
                { id: 'action', label: '액션', align: 'right' },
              ]}
            />
            <TableBody>
              {displayedGroups.map((row) => (
                <GroupTableRow
                  key={row.id}
                  row={row}
                  selected={table.selected.includes(String(row.id))}
                  onSelectRow={() => table.onSelectRow(String(row.id))}
                  onViewGroup={handleViewGroup}
                  onEditGroup={handleEditGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onViewMembers={handleViewMembers}
                  onViewQuestions={handleViewQuestions}
                  onAssignQuestions={handleAssignQuestions}
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
            총 {dataFiltered.length}개 중 {dataFiltered.length === 0 ? 0 : table.page * table.rowsPerPage + 1}-
            {Math.min((table.page + 1) * table.rowsPerPage, dataFiltered.length)}개 표시
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

      <GroupCreateModal
        open={openCreateModal}
        onClose={handleModalClose}
      />

      <GroupEditModal
        open={openEditModal}
        onClose={handleModalClose}
        group={selectedGroup}
      />

      <GroupMembersModal
        open={openMembersModal}
        onClose={handleModalClose}
        group={selectedGroup}
      />

      <GroupQuestionsModal
        open={openQuestionsModal}
        onClose={handleModalClose}
        group={selectedGroup}
      />

      <GroupManageModal
        open={openManageModal}
        onClose={() => setOpenManageModal(false)}
        onDeleted={handleModalClose}
        group={selectedGroup}
      />

      <UnifiedAssignmentModal
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        preselectedGroupId={groupToAssign?.id}
        onComplete={handleModalClose}
      />
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
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
