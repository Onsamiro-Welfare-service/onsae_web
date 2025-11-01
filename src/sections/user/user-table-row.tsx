import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/iconify';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  name: string;
  code: string;
  phoneNumber: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  groupIds: number[];
  status: 'active' | 'inactive';
  avatarUrl: string;
};

type UserTableRowProps = {
  row: UserProps;
  groupMap: Record<number, string>;
  selected: boolean;
  onSelectRow: () => void;
  onEditUser: (user: UserProps) => void;
  onDeleteUser: (userId: string) => void;
  onViewUser: (user: UserProps) => void;
  onAssignUser?: (user: UserProps) => void;
};

const groupColorMap: Record<string, string> = {
  고혈압: '#cc3333',
  당뇨병: '#ff6600',
  심장질환: '#cc0066',
  치매: '#6600cc',
};

const statusLabelMap: Record<UserProps['status'], string> = {
  active: '활성',
  inactive: '비활성',
};

export function UserTableRow({
  row,
  groupMap,
  selected,
  onSelectRow,
  onEditUser: _onEditUser,
  onDeleteUser: _onDeleteUser,
  onViewUser,
  onAssignUser,
}: UserTableRowProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const getGroupColor = (group: string) => groupColorMap[group] ?? '#666666';
  const getStatusColor = (status: UserProps['status']) => (status === 'active' ? 'success.main' : 'grey.500');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAssign = () => {
    handleMenuClose();
    if (onAssignUser) {
      onAssignUser(row);
    }
  };

  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
      selected={selected}
      onClick={() => onViewUser(row)}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell component="th" scope="row" sx={{ px: 2, pl: 4 }}>
        <Box
          sx={{
            gap: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Avatar
            alt={row.name}
            src={row.avatarUrl}
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
            }}
          />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              코드 {row.code}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell sx={{ px: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {row.phoneNumber}
        </Typography>
      </TableCell>

      {/* <TableCell>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            보호자 {row.guardianName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.guardianRelation} · {row.guardianPhone}
          </Typography>
        </Box>
      </TableCell> */}

      <TableCell sx={{ px: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {row.groupIds && row.groupIds.length
            ? row.groupIds.map((id) => groupMap[id] ?? id.toString()).join(', ')
            : '-'}
        </Typography>
      </TableCell>

      <TableCell sx={{ px: 2 }}>
        <Chip
          label={statusLabelMap[row.status]}
          size="small"
          sx={{
            bgcolor: getStatusColor(row.status),
            color: 'common.white',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
            borderRadius: 1,
            lineHeight: 1,
          }}
        />
      </TableCell>

      <TableCell align="right" sx={{ px: 2, pr: 4 }} onClick={(event) => event.stopPropagation()}>
        <IconButton onClick={handleMenuOpen} size="small">
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleAssign}>
            <ListItemIcon>
              <Iconify icon="solar:add-circle-bold" width={20} />
            </ListItemIcon>
            <ListItemText>질문 할당</ListItemText>
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
}
