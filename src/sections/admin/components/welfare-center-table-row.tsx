import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { Label } from '@/components/label';

// ----------------------------------------------------------------------

export type WelfareCenterProps = {
  id: string;
  name: string;
  address: string;
  admin: string;
  userCount: number;
  status: 'active' | 'inactive';
  registeredAt: string;
};

type WelfareCenterTableRowProps = {
  welfareCenter: WelfareCenterProps;
  onDetail: () => void;
};

export function WelfareCenterTableRow({ welfareCenter, onDetail }: WelfareCenterTableRowProps) {
  const { name, address, admin, userCount, status, registeredAt } = welfareCenter;

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {name}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>
          {address}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {admin}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {userCount}명
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
          {registeredAt}
        </Typography>
      </TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={onDetail}
            sx={{
              bgcolor: 'primary.main',
              fontSize: 12,
              fontWeight: 500,
              px: 2,
              py: 0.5,
              '&:hover': {
                bgcolor: 'primary.dark',
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