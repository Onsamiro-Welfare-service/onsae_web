import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { Label } from '@/components/label';

import type { UploadListResponse } from '@/types/api';

// ----------------------------------------------------------------------

export type UploadRow = UploadListResponse;

type UploadTableRowProps = {
  row: UploadRow;
  selected: boolean;
  onSelectRow: () => void;
  onRowClick: () => void;
};

const getStatusText = (adminRead: boolean): string => {
  return adminRead ? '확인 완료' : '처리 대기';
};

const getStatusColor = (adminRead: boolean): 'success' | 'warning' => {
  return adminRead ? 'success' : 'warning';
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

      <TableCell component="th" scope="row" sx={{ px: 2, pl: 4 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {row.userName || '-'}
        </Typography>
      </TableCell>

      <TableCell sx={{ px: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {row.createdAt 
            ? new Date(row.createdAt).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-'}
        </Typography>
      </TableCell>

      <TableCell sx={{ px: 2 }}>
        <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
          {row.contentPreview || row.title || '-'}
        </Typography>
      </TableCell>

      <TableCell sx={{ px: 2 }}>
        <Label variant="soft" color={getStatusColor(row.adminRead)}>
          {getStatusText(row.adminRead)}
        </Label>
      </TableCell>
    </TableRow>
  );
}
