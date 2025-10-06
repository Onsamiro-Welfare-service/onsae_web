import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type TableNoDataProps = {
  query?: string;
};

export function TableNoData({ query }: TableNoDataProps) {
  return (
    <TableRow>
      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
        <Paper
          sx={{
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" paragraph>
            찾을 수 없음
          </Typography>

          <Typography variant="body2">
            <strong>&quot;{query}&quot;</strong>에 대한 결과를 찾을 수 없습니다.
            <br /> 다른 검색어를 시도해보세요.
          </Typography>
        </Paper>
      </TableCell>
    </TableRow>
  );
} 