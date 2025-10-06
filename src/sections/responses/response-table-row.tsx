import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { Label } from '@/components/label';

import type { Response } from '@/types/api';

// ----------------------------------------------------------------------

export type ResponseProps = Response;

type ResponseTableRowProps = {
  row: ResponseProps;
  selected: boolean;
  onSelectRow: () => void;
  onRowClick: () => void;
};

type StatusLabel = Record<ResponseProps['status'], string>;

const STATUS_TEXT: StatusLabel = {
  completed: '완료',
  incomplete: '미완료',
};

export function ResponseTableRow({ row, selected, onSelectRow, onRowClick }: ResponseTableRowProps) {
  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
      selected={selected}
      sx={{ cursor: 'pointer' }}
      onClick={onRowClick}
    >
      <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell component="th" scope="row">
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ ml: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {row.userName} ({row.userCode})
            </Typography>
          </Box>
        </Box>
      </TableCell>

      <TableCell>{row.submittedAt}</TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
          {row.responseSummary}
        </Typography>
      </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={(row.status === 'completed' && 'success') || (row.status === 'incomplete' && 'warning') || 'default'}
        >
          {STATUS_TEXT[row.status]}
        </Label>
      </TableCell>
    </TableRow>
  );
}
