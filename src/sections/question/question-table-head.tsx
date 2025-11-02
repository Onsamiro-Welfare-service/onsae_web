import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableSortLabel from '@mui/material/TableSortLabel';

import { visuallyHidden } from './utils';

// ----------------------------------------------------------------------

type QuestionTableHeadProps = {
  orderBy: string;
  rowCount: number;
  numSelected: number;
  order: 'asc' | 'desc';
  onSort: (id: string) => void;
  headLabel: Record<string, any>[];
  onSelectAllRows: (checked: boolean, newSelecteds: string[]) => void;
};

export function QuestionTableHead({
  order,
  orderBy,
  rowCount,
  numSelected,
  onSort,
  headLabel,
  onSelectAllRows,
}: QuestionTableHeadProps) {
  return (
    <TableHead>
      <TableRow sx={{ bgcolor: '#f2f2f2' }}>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={(event) => onSelectAllRows(event.target.checked, [])}
          />
        </TableCell>

        {headLabel.map((headCell, index) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              bgcolor: '#f2f2f2',
              borderBottom: '1px solid #e6e6e6',
              px: 2,
              ...(index === 0 && { pl: 4 }),
              ...(index === headLabel.length - 1 && { pr: 4 }),
            }}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onSort(headCell.id)}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {headCell.label}
              </Typography>
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
} 