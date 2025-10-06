
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  name: string;
  code: string;
  phoneNumber: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  group: string;
  status: 'active' | 'inactive';
  avatarUrl: string;
};

type UserTableRowProps = {
  row: UserProps;
  selected: boolean;
  onSelectRow: () => void;
  onEditUser: (user: UserProps) => void;
  onDeleteUser: (userId: string) => void;
  onViewUser: (user: UserProps) => void;
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
  selected,
  onSelectRow,
  onEditUser: _onEditUser,
  onDeleteUser: _onDeleteUser,
  onViewUser,
}: UserTableRowProps) {
  const getGroupColor = (group: string) => groupColorMap[group] ?? '#666666';
  const getStatusColor = (status: UserProps['status']) => (status === 'active' ? 'success.main' : 'grey.500');

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

      <TableCell component="th" scope="row">
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
              코드 {row.code} · {row.phoneNumber}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      <TableCell>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            보호자 {row.guardianName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.guardianRelation} · {row.guardianPhone}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>
        <Chip
          label={row.group}
          size="small"
          sx={{
            bgcolor: getGroupColor(row.group),
            color: 'common.white',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
            borderRadius: 1,
            lineHeight: 1,
          }}
        />
      </TableCell>

      <TableCell>
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
    </TableRow>
  );
}
