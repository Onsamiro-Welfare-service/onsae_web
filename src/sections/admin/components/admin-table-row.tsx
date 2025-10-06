import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { Label } from '@/components/label';

// ----------------------------------------------------------------------

export type AdminProps = {
  id: string;
  name: string;
  welfareCenter: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
};

type AdminTableRowProps = {
  admin: AdminProps;
  onDetail: () => void;
};

export function AdminTableRow({ admin, onDetail }: AdminTableRowProps) {
  const { name, welfareCenter, email, role, status, lastLogin } = admin;

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {name}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
          {welfareCenter}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {email}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {role}
        </Typography>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={status === 'active' ? 'success' : 'error'}
          sx={{ fontSize: 12, fontWeight: 500 }}
        >
          {status === 'active' ? '활성' : '비활성'}
        </Label>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
          {lastLogin}
        </Typography>
      </TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={onDetail}
            sx={{
              bgcolor: '#177578',
              fontSize: 12,
              fontWeight: 500,
              px: 2,
              py: 0.5,
              '&:hover': {
                bgcolor: '#0f5a5c',
              },
            }}
          >
            상세보기
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderColor: '#cccccc',
              fontSize: 12,
              fontWeight: 500,
              px: 2,
              py: 0.5,
            }}
          >
            수정
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
} 