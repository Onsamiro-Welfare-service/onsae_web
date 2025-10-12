import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import type { ChangeInfo } from '@/types/api';

// ----------------------------------------------------------------------

export interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  change?: ChangeInfo;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export function DashboardStatsCard({
  title,
  value,
  change,
  icon,
  color = 'primary',
}: DashboardStatsCardProps) {
  const theme = useTheme();

  const colorMap = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  const bgColor = colorMap[color];

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        height: 160,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(bgColor, 0.12)} 0%, transparent 70%)`,
        }}
      />

      {/* Icon */}
      {icon && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: alpha(bgColor, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: bgColor,
            fontSize: 24,
          }}
        >
          {icon}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: 'text.secondary',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontSize: 32,
            color: 'text.primary',
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
      </Box>

      {/* Change indicator */}
      {change && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: change.value > 0 ? 'success.main' : change.value < 0 ? 'error.main' : 'text.secondary',
            }}
          >
            {change.value > 0 ? '+' : ''}
            {change.value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {change.period}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
