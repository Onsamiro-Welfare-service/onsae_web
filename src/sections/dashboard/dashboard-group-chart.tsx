'use client';

import { ApexOptions } from 'apexcharts';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';

import type { GroupInfo } from '@/types/api';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ----------------------------------------------------------------------

export interface DashboardGroupChartProps {
  groups: GroupInfo[];
}

export function DashboardGroupChart({ groups }: DashboardGroupChartProps) {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
    },
    labels: groups.map((g) => g.groupName),
    colors: groups.map((g) => g.color),
    legend: {
      position: 'right',
      offsetY: 0,
      height: 230,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: '총 인원',
              formatter: () => {
                const total = groups.reduce((sum, g) => sum + g.memberCount, 0);
                return `${total}명`;
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
  };

  const series = groups.map((g) => g.memberCount);

  return (
    <Card sx={{ p: 3, borderRadius: 2, height: 400 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
        사용자 그룹 현황
      </Typography>
      <Box sx={{ height: 320 }}>
        <Chart options={chartOptions} series={series} type="donut" height="100%" />
      </Box>
    </Card>
  );
}
