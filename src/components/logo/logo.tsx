'use client';

import type { LinkProps } from '@mui/material/Link';

import { useId } from 'react';
import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';

import { RouterLink } from '@/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  const theme = useTheme();

  const gradientId = useId();

  const PRIMARY_LIGHT = theme.vars.palette.primary.light;
  const PRIMARY_MAIN = theme.vars.palette.primary.main;
  const PRIMARY_DARKER = theme.vars.palette.primary.dark;

  const singleLogo = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`${gradientId}-1`}
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={PRIMARY_LIGHT} />
            <stop offset="1" stopColor={PRIMARY_MAIN} />
          </linearGradient>
        </defs>
        {/* 메인 하트 모양 */}
        <path
          fill={`url(#${gradientId}-1)`}
          d="M16 28c-1.5-1.5-3-3-4.5-4.5C8.5 20.5 6 17.5 6 14c0-3.5 2.5-6 6-6 2 0 3.5 1 4 2.5C16.5 9 18 8 20 8c3.5 0 6 2.5 6 6 0 3.5-2.5 6.5-5.5 9.5C19 25 17.5 26.5 16 28z"
        />
        {/* 작은 하트 (겹치는 효과) */}
        <path
          fill={PRIMARY_DARKER}
          d="M16 24c-1-1-2-2-3-3C10.5 18.5 8.5 16.5 8.5 14c0-2 1.5-3.5 3.5-3.5 1 0 2 0.5 2.5 1.5C14.5 10.5 15.5 10 16.5 10c2 0 3.5 1.5 3.5 3.5 0 2.5-2 4.5-4 7C15.5 22 16.5 23 16 24z"
          opacity="0.7"
        />
      </svg>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: '#000000',
          fontSize: '20px',
          lineHeight: 1,
        }}
      >
        온새미로
      </Typography>
    </Box>
  );

  const fullLogo = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`${gradientId}-1`}
            x1="0"
            y1="0"
            x2="48"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={PRIMARY_LIGHT} />
            <stop offset="1" stopColor={PRIMARY_MAIN} />
          </linearGradient>
        </defs>
        {/* 메인 하트 모양 */}
        <path
          fill={`url(#${gradientId}-1)`}
          d="M24 42c-2.25-2.25-4.5-4.5-6.75-6.75C12.75 30.75 9 26.25 9 21c0-5.25 3.75-9 9-9 3 0 5.25 1.5 6 3.75C24.75 13.5 27 12 30 12c5.25 0 9 3.75 9 9 0 5.25-3.75 9.75-8.25 14.25C28.5 37.5 26.25 39.75 24 42z"
        />
        {/* 작은 하트 (겹치는 효과) */}
        <path
          fill={PRIMARY_DARKER}
          d="M24 36c-1.5-1.5-3-3-4.5-4.5C15.75 27.75 12.75 24.75 12.75 21c0-3 2.25-5.25 5.25-5.25 1.5 0 3 0.75 3.75 2.25C21.75 15.75 23.25 15 24.75 15c3 0 5.25 2.25 5.25 5.25 0 3.75-3 6.75-6 10.5C22.5 33 23.25 34.5 24 36z"
          opacity="0.7"
        />
      </svg>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            fontSize: '24px',
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          온새미로
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#666666',
            fontSize: '12px',
            lineHeight: 1,
          }}
        >
          복지관 케어 시스템
        </Typography>
      </Box>
    </Box>
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="온새미로 로고"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 'auto',
          height: 'auto',
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
