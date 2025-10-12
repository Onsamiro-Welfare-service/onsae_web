import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import type { ActivityInfo } from '@/types/api';

// ----------------------------------------------------------------------

export interface DashboardActivitiesTableProps {
  activities: ActivityInfo[];
}

export function DashboardActivitiesTable({ activities }: DashboardActivitiesTableProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'response':
        return '📝';
      case 'upload':
        return '📤';
      case 'approval':
        return '✅';
      default:
        return '•';
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'incomplete':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        최근 활동
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>유형</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>사용자</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>활동 내용</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>시간</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    최근 활동 내역이 없습니다
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{getActivityIcon(activity.type)}</span>
                      <Typography variant="body2">{activity.type}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {activity.user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {activity.user.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {activity.question?.title || activity.upload?.fileName || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: ko })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={activity.status} size="small" color={getStatusColor(activity.status)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
