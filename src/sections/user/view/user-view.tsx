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
import { userService } from '@/services/userService';

import { Scrollbar } from '@/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { UserAddModal } from '../components/user-add-modal';
import { UserDetailModal } from '../components/user-detail-modal';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { User } from '@/types/api';
import type { UserProps } from '../user-table-row';
import type { CreateUserRequest } from '@/types/api';

// ----------------------------------------------------------------------

const mapUserToRow = (user: User): UserProps => ({
  id: user.id,
  name: user.name,
  code: user.code,
  phoneNumber: user.phoneNumber,
  guardianName: user.guardianName,
  guardianRelation: user.guardianRelation,
  guardianPhone: user.guardianPhone,
  group: user.group,
  status: user.status === 'active' ? 'active' : 'inactive',
  avatarUrl: user.avatarUrl ?? '/assets/images/avatar/avatar-placeholder.webp',
});

export function UserView() {
  const table = useTable();
  const [filterName, setFilterName] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [users, setUsers] = useState<UserProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await userService.getUsers({ page: 1, limit: 200 });
        if (!isMounted) return;

        setUsers(response.data.map(mapUserToRow));
        table.onResetPage();
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : '사용자 데이터를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dataFiltered: UserProps[] = applyFilter({
    inputData: users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const handleAddUser = useCallback(() => {
    setOpenAddModal(true);
  }, []);

  const handleViewUser = useCallback((user: UserProps) => {
    setSelectedUser(user);
    setOpenViewModal(true);
  }, []);

  const handleEditUser = useCallback((user: UserProps) => {
    console.log('Edit user:', user);
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    console.log('Delete user:', userId);
  }, []);

  const handleSaveUser = useCallback(async (userData: CreateUserRequest) => {
    const created = await userService.createUser(userData);
    setUsers((prev) => [mapUserToRow(created), ...prev]);
    table.onResetPage();
  }, [table]);

  const displayedUsers = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

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
          사용자 관리
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

        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          onAddUser={handleAddUser}
        />

        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
            {error}
          </Alert>
        )}

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    users.map((user) => user.id)
                  )
                }
                headLabel={[
                  { id: 'name', label: '사용자 정보' },
                  { id: 'phoneNumber', label: '연락처' },
                  { id: 'group', label: '그룹' },
                  { id: 'status', label: '상태' },
                ]}
              />
              <TableBody>
                {displayedUsers.map((row) => (
                  <UserTableRow
                    key={row.id}
                    row={row}
                    selected={table.selected.includes(row.id)}
                    onSelectRow={() => table.onSelectRow(row.id)}
                    onEditUser={handleEditUser}
                    onDeleteUser={handleDeleteUser}
                    onViewUser={handleViewUser}
                  />
                ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, users.length)}
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
            borderTop: '1px solid #e6e6e6',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            총 {users.length}명 중 {users.length === 0 ? 0 : table.page * table.rowsPerPage + 1}-
            {Math.min((table.page + 1) * table.rowsPerPage, users.length)}명 표시
          </Typography>

          <TablePagination
            component="div"
            page={table.page}
            count={users.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            rowsPerPageOptions={[5, 10, 25]}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            labelRowsPerPage="페이지당 행 수:"
          />
        </Box>
      </Card>

      <UserAddModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSave={handleSaveUser}
      />

      <UserDetailModal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        user={selectedUser}
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
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}



