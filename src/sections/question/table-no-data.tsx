import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type TableNoDataProps = {
  searchQuery?: string;
};

export function TableNoData({ searchQuery }: TableNoDataProps) {
  return (
    <Box
      sx={{
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        {searchQuery ? '검색 결과가 없습니다' : '데이터가 없습니다'}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {searchQuery
          ? `"${searchQuery}"에 대한 검색 결과를 찾을 수 없습니다.`
          : '아직 등록된 질문이 없습니다.'}
      </Typography>
    </Box>
  );
} 