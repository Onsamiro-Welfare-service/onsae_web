import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from '@/components/iconify';

// ----------------------------------------------------------------------

type AdminTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddItem: () => void;
  activeTab: number;
};

export function AdminTableToolbar({ 
  numSelected, 
  filterName, 
  onFilterName, 
  onAddItem,
  activeTab
}: AdminTableToolbarProps) {
  const getPlaceholder = () => activeTab === 0 
    ? '복지관명 또는 관리자명 검색...' 
    : '관리자명 또는 이메일 검색...';

  const getAddButtonText = () => activeTab === 0 ? '새 복지관' : '새 관리자';

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
        p: (theme) => theme.spacing(2, 3),
        bgcolor: '#ffffff',
        borderRadius: '12px 12px 0 0',
        borderBottom: '1px solid #e5e5e5',
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected}개 선택됨
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
          {/* 검색 입력창 */}
          <OutlinedInput
            value={filterName}
            onChange={onFilterName}
            placeholder={getPlaceholder()}
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
              bgcolor: '#fafafa',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#cccccc',
              },
            }}
          />

          {/* 필터 드롭다운들 */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              width: { xs: '100%', sm: 'auto' },
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            {/* 상태 필터 드롭다운 */}
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <Select
                value="all"
                displayEmpty
                sx={{
                  height: 48,
                  bgcolor: '#fafafa',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e5e5',
                  },
                }}
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="active">활성</MenuItem>
                <MenuItem value="inactive">비활성</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      {/* 액션 버튼 */}
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
          <Button
            variant="contained"
            onClick={onAddItem}
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{
              bgcolor: 'primary.main',
              height: 48,
              px: 3,
              borderRadius: 2,
              fontWeight: 700,
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            + {getAddButtonText()}
          </Button>
        )}
      </Box>
    </Toolbar>
  );
} 