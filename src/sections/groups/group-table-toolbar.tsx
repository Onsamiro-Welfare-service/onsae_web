import type { ChangeEvent } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';

// ----------------------------------------------------------------------

type GroupTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: ChangeEvent<HTMLInputElement>) => void;
  onAddGroup: () => void;
};

export function GroupTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  onAddGroup,
}: GroupTableToolbarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        p: (themeArg) => themeArg.spacing(2, 3),
        bgcolor: 'background.paper',
        borderRadius: '12px 12px 0 0',
        borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`,
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
          {/* 검색 기능은 필요시 추가 */}
        </Box>
      )}

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
            onClick={onAddGroup}
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            sx={{
              bgcolor: 'primary.main',
              height: 48,
              px: 3,
              borderRadius: 2,
              fontWeight: 700,
              width: { xs: '100%', sm: 'auto' },
              whiteSpace: 'nowrap',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            그룹 생성
          </Button>
        )}
      </Box>
    </Toolbar>
  );
}

