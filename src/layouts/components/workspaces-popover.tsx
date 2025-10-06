import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export type WorkspacesPopoverProps = ButtonBaseProps & {
  data?: {
    id: string;
    name: string;
    logo: string;
    plan: string;
    role?: string;
  };
};

export function WorkspacesPopover({ data, sx, ...other }: WorkspacesPopoverProps) {
  if (!data) {
    return null;
  }

  return (
    <ButtonBase
      disableRipple
      sx={{
        pl: 1,
        py: 1,
        gap: 1.5,
        pr: 1.5,
        width: 1,
        borderRadius: 1.5,
        textAlign: 'left',
        justifyContent: 'flex-start',
        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        ...sx,
      }}
      {...other}
    >
      <Box
        sx={{
          gap: 1,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          typography: 'body2',
          fontWeight: 'fontWeightSemiBold',
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>
            {data.name}
          </Typography>
          {data.role && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {data.role}
            </Typography>
          )}
        </Box>
      </Box>
    </ButtonBase>
  );
}
