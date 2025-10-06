import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from '@/components/iconify';

// ----------------------------------------------------------------------

export type QuestionProps = {
  id: string;
  title: string;
  content: string;
  category: string;
  type: string;
  priority: '높음' | '중간' | '낮음';
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
};

export function QuestionTableRow({
  row,
  selected,
  onSelectRow,
  onEditQuestion,
  onDeleteQuestion,
  onViewQuestion,
}: QuestionTableRowProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '높음':
        return '#cc3333';
      case '중간':
        return '#3366cc';
      case '낮음':
        return '#33cc33';
      default:
        return '#666666';
    }
  };

  const getStatusColor = (status: string) => status === 'active' ? '#33cc33' : '#cccccc';

  const handleRowClick = (event: React.MouseEvent) => {
    // 체크박스나 액션 버튼 클릭 시에는 모달이 열리지 않도록
    if (
      (event.target as HTMLElement).closest('input[type="checkbox"]') ||
      (event.target as HTMLElement).closest('button')
    ) {
      return;
    }
    onViewQuestion(row);
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
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {row.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {row.content.length > 50 ? `${row.content.substring(0, 50)}...` : row.content}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>
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

      <TableCell>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {row.type}
        </Typography>
      </TableCell>

      <TableCell>
        <Chip
          label={row.priority}
          size="small"
          sx={{
            bgcolor: getPriorityColor(row.priority),
            color: 'white',
            fontWeight: 500,
          }}
        />
      </TableCell>

      <TableCell>
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


    </TableRow>
  );
}