import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';


import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { UserGroupAddModal } from './components/user-group-add-modal';
import { userGroupService } from '@/services/userGroupService';

// ----------------------------------------------------------------------

type UserTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: ChangeEvent<HTMLInputElement>) => void;
  onAddUser: () => void;
  groupFilter: string;
  onChangeGroupFilter: (value: string) => void;
  statusFilter: string;
  onChangeStatusFilter: (value: string) => void;
};

const statusFilterOptions = [
  { value: 'all', label: '전체 이용자' },
  { value: 'active', label: '활성 이용자' },
  { value: 'inactive', label: '비활성 이용자' },
];

type GroupOption = { value: string; label: string };

export function UserTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  onAddUser,
  groupFilter,
  onChangeGroupFilter,
  statusFilter,
  onChangeStatusFilter,
}: UserTableToolbarProps) {
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [groupOptions, setGroupOptions] = useState<GroupOption[]>([
    { value: 'all', label: '전체 그룹' },
  ]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoadingGroups(true);
        const groups = await userGroupService.getUserGroups();
        if (!mounted) return;
        const dynamic = groups.map((g) => ({ value: g.name, label: g.name }));
        setGroupOptions((prev) => [prev[0], ...dynamic]);
      } catch (e) {
        // ignore; keep only '전체 그룹'
        console.error('그룹 목록 조회 실패', e);
      } finally {
        mounted = false;
        setIsLoadingGroups(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Toolbar
      sx={{
        height: { xs: 'auto', md: 96 },
        minHeight: { xs: 80, md: 96 },
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', md: 'center' },
        gap: { xs: 2, md: 0 },
        p: (themeArg) => themeArg.spacing(2, 3),
        bgcolor: 'background.paper',
        borderRadius: '12px 12px 0 0',
        borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`,
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected}명 선택됨
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flex: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <OutlinedInput
            value={filterName}
            onChange={onFilterName}
            placeholder="이용자 이름, 코드, 전화번호로 검색"
            startAdornment={
              <InputAdornment position="start">
                <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            sx={{
              flex: { xs: 'none', sm: 1 },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '100%', sm: 320 },
              minWidth: { xs: '100%', sm: 200 },
              height: 48,
              bgcolor: 'grey.100',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
            }}
          />

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              width: { xs: '100%', sm: 'auto' },
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 180 },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Select
                value={statusFilter}
                displayEmpty
                onChange={(e) => onChangeStatusFilter(String(e.target.value))}
                sx={{
                  height: 48,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                }}
                inputProps={{ 'aria-label': '이용자 상태 필터' }}
              >
                {statusFilterOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: { xs: '100%', sm: 180 },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Select
                value={groupFilter}
                displayEmpty
                onChange={(e) => onChangeGroupFilter(String(e.target.value))}
                sx={{
                  height: 48,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                }}
                inputProps={{ 'aria-label': '케어 그룹 필터' }}
              >
                {groupOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: { xs: 'center', md: 'flex-end' },
          width: { xs: '100%', md: 'auto' },
          mt: { xs: numSelected > 0 ? 0 : 2, md: 0 },
        }}
      >
        {numSelected > 0 ? (
          <Tooltip title="삭제">
            <IconButton>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setOpenGroupModal(true)}
              startIcon={<Iconify icon="eva:plus-fill" />}
              sx={{
                height: 48,
                px: 2.5,
                borderRadius: 2,
                fontWeight: 600,
                width: { xs: '100%', sm: 'auto' },
                whiteSpace: 'nowrap'
              }}
            >
              그룹 추가
            </Button>

            <Button
              variant="contained"
              onClick={onAddUser}
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={{
                bgcolor: 'primary.main',
                height: 48,
                px: 3,
                borderRadius: 2,
                fontWeight: 700,
                width: { xs: '100%', sm: 'auto' },
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              이용자 추가
            </Button>
          </Box>
        )}
      </Box>

      <UserGroupAddModal
        open={openGroupModal}
        onClose={() => setOpenGroupModal(false)}
        onCreated={(g) =>
          setGroupOptions((opts) => {
            const exists = opts.some((o) => o.value === g.name);
            return exists ? opts : [...opts, { value: g.name, label: g.name }];
          })
        }
      />
    </Toolbar>
  );
}
