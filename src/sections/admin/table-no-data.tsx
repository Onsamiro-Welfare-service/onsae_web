import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type TableNoDataProps = {
  query: string;
};

export function TableNoData({ query }: TableNoDataProps) {
  return (
    <Box
      sx={{
        py: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        검색 결과가 없습니다
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        &quot;{query}&quot;에 대한 검색 결과를 찾을 수 없습니다.
      </Typography>
    </Box>
  );
}