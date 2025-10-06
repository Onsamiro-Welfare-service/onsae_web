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
        <Paper sx={{ textAlign: 'center' }}>
          <Typography variant="h6" paragraph>
            검색 결과가 없습니다.
          </Typography>

          <Typography variant="body2">
            <strong>&quot;{query}&quot;</strong>에 대한 업로드를 찾지 못했습니다.
            <br /> 검색 범위를 넓혀 다시 시도해 주세요.
          </Typography>
        </Paper>
      </TableCell>
    </TableRow>
  );
}
