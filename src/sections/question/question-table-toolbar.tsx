import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import useMediaQuery from '@mui/material/useMediaQuery';
import InputAdornment from '@mui/material/InputAdornment';
import { useEffect, useState } from 'react';

import { Iconify } from '@/components/iconify';
import { categoryService } from '@/services/categoryService';
import type { Category } from '@/types/api';

type QuestionTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddQuestion: () => void;
  onAddCategory: () => void;
  categoryFilter: string;
  onChangeCategoryFilter: (value: string) => void;
};

export function QuestionTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  onAddQuestion,
  onAddCategory,
  categoryFilter,
  onChangeCategoryFilter,
}: QuestionTableToolbarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await categoryService.getActiveCategories();
        if (!active) return;
        setCategories(list);
      } catch {
        // keep empty
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
        p: (t) => t.spacing(2, 3),
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
          <OutlinedInput
            value={filterName}
            onChange={onFilterName}
            placeholder="질문 제목, 내용으로 검색..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
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

          <FormControl sx={{ minWidth: 200, width: isMobile ? '100%' : 'auto' }}>
            <Select
              value={categoryFilter}
              displayEmpty
              onChange={(e) => onChangeCategoryFilter(String(e.target.value))}
              inputProps={{ 'aria-label': 'category filter' }}
            >
              <MenuItem value="">전체 카테고리</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
        <Button
          variant="outlined"
          onClick={onAddCategory}
          startIcon={<Iconify icon="mingcute:folder-add-line" />}
          sx={{
            mr: 1,
            height: 48,
            px: 2,
            borderRadius: 2,
            width: { xs: '100%', sm: 'auto' },
            borderColor: '#cccccc',
            color: '#333333',
          }}
        >
          카테고리 추가
        </Button>
        <Button
          variant="contained"
          onClick={onAddQuestion}
          startIcon={<Iconify icon="mingcute:add-line" />}
          sx={{
            bgcolor: '#177578',
            height: 48,
            px: 3,
            borderRadius: 2,
            fontWeight: 700,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              bgcolor: '#0f5a5c',
            },
          }}
        >
          새 질문
        </Button>
      </Box>
    </Toolbar>
  );
}

