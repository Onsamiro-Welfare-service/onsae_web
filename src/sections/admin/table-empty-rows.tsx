import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

type TableEmptyRowsProps = {
  height: number;
};

export function TableEmptyRows({ height }: TableEmptyRowsProps) {
  return (
    <TableRow
      sx={{
        height,
      }}
    >
      <TableCell colSpan={12} />
    </TableRow>
  );
}