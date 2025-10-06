import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { Label } from '@/components/label';

import type { UploadRecord } from '@/types/api';

// ----------------------------------------------------------------------

export type UploadRow = UploadRecord & {
  uploadType: string;
};

type UploadTableRowProps = {
  row: UploadRow;
  selected: boolean;
  onSelectRow: () => void;
  onRowClick: () => void;
};

const STATUS_TEXT: Record<UploadRow['status'], string> = {
  completed: '확인 완료',
  incomplete: '처리 대기',
};

const STATUS_COLOR: Record<UploadRow['status'], 'success' | 'warning'> = {
  completed: 'success',
  incomplete: 'warning',
};

export function UploadTableRow({ row, selected, onSelectRow, onRowClick }: UploadTableRowProps) {
  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
      selected={selected}
      sx={{
        cursor: 'pointer',
        backgroundColor: selected ? 'rgba(23, 117, 120, 0.08)' : 'inherit',
        '&:nth-of-type(even)': {
          backgroundColor: selected ? 'rgba(23, 117, 120, 0.08)' : '#fafafa',
        },
      }}
      onClick={onRowClick}
    >
      <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell component="th" scope="row">
        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
          {row.uploadType}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">
          {row.userName} ({row.userCode})
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{row.submittedAt}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
          {row.responseSummary}
        </Typography>
      </TableCell>

      <TableCell>
        <Label variant="soft" color={STATUS_COLOR[row.status]}>
          {STATUS_TEXT[row.status]}
        </Label>
      </TableCell>
    </TableRow>
  );
}
