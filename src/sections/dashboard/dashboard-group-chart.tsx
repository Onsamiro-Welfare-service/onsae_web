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
      position: 'bottom',
      offsetY: 0,
      horizontalAlign: 'center',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: '총 인원',
              fontSize: '14px',
              fontWeight: 600,
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
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  const series = groups.map((g) => g.memberCount);

  return (
    <Card sx={{ p: 3, borderRadius: 2, height: '100%', minHeight: 420, width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        사용자 그룹 현황
      </Typography>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 0 }}>
        <Chart options={chartOptions} series={series} type="donut" height="100%" width="100%" />
      </Box>
    </Card>
  );
}
