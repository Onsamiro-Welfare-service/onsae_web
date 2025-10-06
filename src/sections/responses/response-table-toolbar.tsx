import type { ChangeEvent } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from '@/components/iconify';

// ----------------------------------------------------------------------

type ResponseTableToolbarProps = {
  numSelected: number;
  filterName: string;
  filterPeriod: string;
  onFilterName: (event: ChangeEvent<HTMLInputElement>) => void;
  onFilterPeriod: (period: string) => void;
};

const PERIOD_OPTIONS = ['전체', '오늘', '일주일', '한 달'];

export function ResponseTableToolbar({
  numSelected,
  filterName,
  filterPeriod,
  onFilterName,
  onFilterPeriod,
}: ResponseTableToolbarProps) {
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
          {numSelected}개 항목이 선택되었습니다.
        </Typography>
      ) : (
        <OutlinedInput
          value={filterName}
          onChange={onFilterName}
          placeholder="이용자명, 코드 또는 응답 내용을 검색하세요"
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
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
      )}

      {numSelected > 0 ? (
        <Tooltip title="삭제">
          <IconButton>
            <Iconify icon="eva:trash-outline" />
          </IconButton>
        </Tooltip>
      ) : (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ButtonGroup variant="outlined" size="medium">
            {PERIOD_OPTIONS.map((period) => (
              <Button
                key={period}
                variant={filterPeriod === period ? 'contained' : 'outlined'}
                onClick={() => onFilterPeriod(period)}
                sx={{
                  minWidth: 70,
                  fontWeight: filterPeriod === period ? 600 : 400,
                }}
              >
                {period}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      )}
    </Toolbar>
  );
}
