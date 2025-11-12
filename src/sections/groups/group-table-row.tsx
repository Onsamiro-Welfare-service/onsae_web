import { useState } from 'react';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/iconify';

import type { UserGroup } from '@/services/groupService';

// ----------------------------------------------------------------------

export type GroupProps = UserGroup;

type GroupTableRowProps = {
  row: GroupProps;
  selected: boolean;
  onSelectRow: () => void;
  onViewGroup: (group: GroupProps) => void;
  onEditGroup: (group: GroupProps) => void;
  onDeleteGroup: (groupId: number) => void;
  onViewMembers: (group: GroupProps) => void;
  onViewQuestions: (group: GroupProps) => void;
  onAssignQuestions: (group: GroupProps) => void;
};

export function GroupTableRow({
  row,
  selected,
  onSelectRow,
  onViewGroup,
  onEditGroup,
  onDeleteGroup,
  onViewMembers,
  onViewQuestions,
  onAssignQuestions,
}: GroupTableRowProps) {
  const [openMenu, setOpenMenu] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  const handleViewGroup = () => {
    onViewGroup(row);
    handleCloseMenu();
  };

  const handleEditGroup = () => {
    onEditGroup(row);
    handleCloseMenu();
  };

  const handleDeleteGroup = () => {
    onDeleteGroup(row.id);
    handleCloseMenu();
  };

  const handleViewMembers = () => {
    onViewMembers(row);
    handleCloseMenu();
  };

  const handleViewQuestions = () => {
    onViewQuestions(row);
    handleCloseMenu();
  };

  const handleAssignQuestions = () => {
    onAssignQuestions(row);
    handleCloseMenu();
  };

  return (
    <>
      <TableRow
        hover
        tabIndex={-1}
        role="checkbox"
        selected={selected}
        onClick={handleViewGroup}
        sx={{ cursor: 'pointer' }}
      >
        <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row" sx={{ px: 2, pl: 4 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.name}
          </Typography>
        </TableCell>

        <TableCell sx={{ px: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {row.description || '-'}
          </Typography>
        </TableCell>

        <TableCell sx={{ px: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
            {row.memberCount}명
          </Typography>
        </TableCell>

        <TableCell sx={{ px: 2, textAlign: 'center' }}>
          <Chip
            label={row.isActive ? '활성' : '비활성'}
            size="small"
            color={row.isActive ? 'success' : 'default'}
            sx={{ fontWeight: 600 }}
          />
        </TableCell>

        <TableCell sx={{ px: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            {row.createdByName}
          </Typography>
        </TableCell>

        <TableCell sx={{ px: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {new Date(row.createdAt).toLocaleDateString('ko-KR')}
          </Typography>
        </TableCell>

        <TableCell align="right" sx={{ px: 2, pr: 4 }}>
          <IconButton
            onClick={handleOpenMenu}
            sx={{ color: 'text.secondary' }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Menu
        open={!!openMenu}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleAssignQuestions} sx={{ color: 'success.main' }}>
          <Iconify icon="solar:add-circle-bold" sx={{ mr: 2 }} />
          질문 할당
        </MenuItem>
        <MenuItem onClick={handleViewMembers} sx={{ color: 'primary.main' }}>
          <Iconify icon="solar:users-group-rounded-bold" sx={{ mr: 2 }} />
          멤버 관리
        </MenuItem>
        <MenuItem onClick={handleViewQuestions} sx={{ color: 'info.main' }}>
          <Iconify icon="solar:question-circle-bold" sx={{ mr: 2 }} />
          할당된 질문
        </MenuItem>
        <MenuItem onClick={handleEditGroup} sx={{ color: 'warning.main' }}>
          <Iconify icon="solar:pen-bold" sx={{ mr: 2 }} />
          수정
        </MenuItem>
        <MenuItem onClick={handleDeleteGroup} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 2 }} />
          삭제
        </MenuItem>
      </Menu>
    </>
  );
}

