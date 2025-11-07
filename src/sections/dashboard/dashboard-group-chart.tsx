'use client';

import { ApexOptions } from 'apexcharts';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';

import type { UserDistribution } from '@/types/api';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ----------------------------------------------------------------------

export interface DashboardGroupChartProps {
  totalMembers: number;
  userDistribution: UserDistribution;
}

export function DashboardGroupChart({ totalMembers, userDistribution }: DashboardGroupChartProps) {
  // 사용자 분포 데이터 - 백엔드에서 제공하는 categories 배열 사용
  const allLabels = userDistribution.categories.map((cat) => cat.label);
  const allColors = userDistribution.categories.map((cat) => cat.color);
  const allSeries = userDistribution.categories.map((cat) => cat.userCount);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
    },
    labels: allLabels,
    colors: allColors,
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
              label: '총 사용자',
              fontSize: '14px',
              fontWeight: 600,
              formatter: () => `${totalMembers}명`,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value}명`,
        title: {
          formatter: (seriesName: string) => `${seriesName}:`,
        },
      },
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

  const series = allSeries;

  return (
    <Card sx={{ p: 3, borderRadius: 2, height: '100%', minHeight: 420, width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          사용자 분포
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          그룹 소속 현황별 사용자 분포
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 0 }}>
        <Chart options={chartOptions} series={series} type="donut" height="100%" width="100%" />
      </Box>
    </Card>
  );
}
