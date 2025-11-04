import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from '@/components/iconify';
import { getQuestionTypeLabel } from './utils';

// ----------------------------------------------------------------------

export type QuestionProps = {
  id: string;
  title: string;
  content: string;
  category: string;
  type: string;
  status: 'active' | 'inactive';
  options: string[];
  createdAt: string;
  createdBy: string;
  totalResponses: number;
  responseRate: number;
  avgResponseTime: number;
  lastResponse: string;
};

type QuestionTableRowProps = {
  row: QuestionProps;
  selected: boolean;
  onSelectRow: () => void;
  onEditQuestion: (question: QuestionProps) => void;
  onDeleteQuestion: (questionId: string) => void;
  onViewQuestion: (question: QuestionProps) => void;
  onAssignQuestion?: (question: QuestionProps) => void;
};

export function QuestionTableRow({
  row,
  selected,
  onSelectRow,
  onEditQuestion: _onEditQuestion,
  onDeleteQuestion: _onDeleteQuestion,
  onViewQuestion,
  onAssignQuestion,
}: QuestionTableRowProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const getStatusColor = (status: string) => status === 'active' ? '#33cc33' : '#cccccc';

  const handleRowClick = (event: React.MouseEvent) => {
    // 체크박스나 액션 버튼 클릭 시에는 모달을 열리지 않도록
    if (
      (event.target as HTMLElement).closest('input[type="checkbox"]') ||
      (event.target as HTMLElement).closest('button')
    ) {
      return;
    }
    onViewQuestion(row);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAssign = () => {
    handleMenuClose();
    if (onAssignQuestion) {
      onAssignQuestion(row);
    }
  };

  return (
    <TableRow 
      hover 
      selected={selected}
      onClick={handleRowClick}
      sx={{ 
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'rgba(23, 117, 120, 0.08)',
        }
      }}
    >
      <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell sx={{ px: 2, pl: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {row.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {row.content.length > 50 ? `${row.content.substring(0, 50)}...` : row.content}
          </Typography>
        </Box>
      </TableCell>

      <TableCell sx={{ px: 2 }}>
        <Chip
          label={row.category}
          size="small"
          sx={{
            bgcolor: '#f0f0f0',
            color: '#333333',
            fontWeight: 500,
          }}
        />
      </TableCell>

      <TableCell sx={{ px: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {getQuestionTypeLabel(row.type)}
        </Typography>
      </TableCell>

      <TableCell sx={{ px: 2 }}>
        <Chip
          label={row.status === 'active' ? '활성' : '비활성'}
          size="small"
          sx={{
            bgcolor: getStatusColor(row.status),
            color: 'white',
            fontWeight: 500,
          }}
        />
      </TableCell>

      <TableCell align="right" sx={{ px: 2, pr: 4 }} onClick={(event) => event.stopPropagation()}>
        <IconButton onClick={handleMenuOpen} size="small">
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleAssign}>
            <ListItemIcon>
              <Iconify icon="solar:add-circle-bold" width={20} />
            </ListItemIcon>
            <ListItemText>질문 할당</ListItemText>
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
}



