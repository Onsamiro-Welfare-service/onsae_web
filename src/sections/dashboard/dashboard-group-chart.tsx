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
  totalMembers: number;
  ungroupedMembers: number;
}

export function DashboardGroupChart({ groups, totalMembers, ungroupedMembers }: DashboardGroupChartProps) {
  // 그룹 없는 사용자를 추가
  const allLabels = [...groups.map((g) => g.groupName), '그룹 없음'];
  const allColors = [...groups.map((g) => g.color), '#9E9E9E']; // 회색
  const allSeries = [...groups.map((g) => g.memberCount), ungroupedMembers];

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
          사용자 그룹 현황
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          * 한 사용자가 여러 그룹에 속할 수 있어 그룹별 인원 합계와 총 사용자 수가 다를 수 있습니다
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 0 }}>
        <Chart options={chartOptions} series={series} type="donut" height="100%" width="100%" />
      </Box>
    </Card>
  );
}
