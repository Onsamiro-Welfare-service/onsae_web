'use client';

import { ApexOptions } from 'apexcharts';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import dynamic from 'next/dynamic';

import type { DailyResponseData } from '@/types/api';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ----------------------------------------------------------------------

export interface DashboardResponseChartProps {
  data: DailyResponseData[];
}

export function DashboardResponseChart({ data }: DashboardResponseChartProps) {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories: data.map((d) => new Date(d.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })),
    },
    yaxis: {
      title: { text: '응답 수' },
    },
    colors: ['#177578', '#4ECDC4'],
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    },
    grid: {
      borderColor: '#f1f1f1',
    },
  };

  const series = [
    {
      name: '총 응답',
      data: data.map((d) => d.totalResponses),
    },
    {
      name: '완료 응답',
      data: data.map((d) => d.completedResponses),
    },
  ];

  return (
    <Card sx={{ p: 3, borderRadius: 2, height: '100%', minHeight: 420, width: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        일별 응답 현황
      </Typography>
      <Box sx={{ height: 340, width: '100%' }}>
        <Chart options={chartOptions} series={series} type="line" height="100%" width="100%" />
      </Box>
    </Card>
  );
}
