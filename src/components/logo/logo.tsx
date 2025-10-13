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

  const TEXT_PRIMARY = theme.vars.palette.text.primary;
  const PRIMARY_LIGHT = theme.vars.palette.primary.light;
  const PRIMARY_MAIN = theme.vars.palette.primary.main;
  const PRIMARY_DARKER = theme.vars.palette.primary.dark;

  const singleLogo = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`${gradientId}-1`}
            x1="152"
            y1="167.79"
            x2="65.523"
            y2="259.624"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={PRIMARY_DARKER} />
            <stop offset="1" stopColor={PRIMARY_MAIN} />
          </linearGradient>
          <linearGradient
            id={`${gradientId}-2`}
            x1="86"
            y1="128"
            x2="86"
            y2="384"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={PRIMARY_LIGHT} />
            <stop offset="1" stopColor={PRIMARY_MAIN} />
          </linearGradient>
          <linearGradient
            id={`${gradientId}-3`}
            x1="402"
            y1="288"
            x2="402"
            y2="384"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={PRIMARY_LIGHT} />
            <stop offset="1" stopColor={PRIMARY_MAIN} />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${`${gradientId}-1`})`}
          d="M86.352 246.358C137.511 214.183 161.836 245.017 183.168 285.573C165.515 317.716 153.837 337.331 148.132 344.418C137.373 357.788 125.636 367.911 111.202 373.752C80.856 388.014 43.132 388.681 14 371.048L86.352 246.358Z"
        />
        <path
          fill={`url(#${`${gradientId}-2`})`}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M444.31 229.726C398.04 148.77 350.21 72.498 295.267 184.382C287.751 198.766 282.272 226.719 270 226.719V226.577C257.728 226.577 252.251 198.624 244.735 184.24C189.79 72.356 141.96 148.628 95.689 229.584C92.207 235.69 88.862 241.516 86 246.58C192.038 179.453 183.11 382.247 270 383.858V384C356.891 382.389 347.962 179.595 454 246.72C451.139 241.658 447.794 235.832 444.31 229.726Z"
        />
        <path
          fill={`url(#${`${gradientId}-3`})`}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M450 384C476.509 384 498 362.509 498 336C498 309.491 476.509 288 450 288C423.491 288 402 309.491 402 336C402 362.509 423.491 384 450 384Z"
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
        온세미로
      </Typography>
    </Box>
  );

  const fullLogo = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`${gradientId}-1`}
            x1="152"
            y1="167.79"
            x2="65.523"
            y2="259.624"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={PRIMARY_DARKER} />
            <stop offset="1" stopColor={PRIMARY_MAIN} />
          </linearGradient>
          <linearGradient
            id={`${gradientId}-2`}
            x1="86"
            y1="128"
            x2="86"
            y2="384"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={PRIMARY_LIGHT} />
            <stop offset="1" stopColor={PRIMARY_MAIN} />
          </linearGradient>
          <linearGradient
            id={`${gradientId}-3`}
            x1="402"
            y1="288"
            x2="402"
            y2="384"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor={PRIMARY_LIGHT} />
            <stop offset="1" stopColor={PRIMARY_MAIN} />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${`${gradientId}-1`})`}
          d="M86.352 246.358C137.511 214.183 161.836 245.017 183.168 285.573C165.515 317.716 153.837 337.331 148.132 344.418C137.373 357.788 125.636 367.911 111.202 373.752C80.856 388.014 43.132 388.681 14 371.048L86.352 246.358Z"
        />
        <path
          fill={`url(#${`${gradientId}-2`})`}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M444.31 229.726C398.04 148.77 350.21 72.498 295.267 184.382C287.751 198.766 282.272 226.719 270 226.719V226.577C257.728 226.577 252.251 198.624 244.735 184.24C189.79 72.356 141.96 148.628 95.689 229.584C92.207 235.69 88.862 241.516 86 246.58C192.038 179.453 183.11 382.247 270 383.858V384C356.891 382.389 347.962 179.595 454 246.72C451.139 241.658 447.794 235.832 444.31 229.726Z"
        />
        <path
          fill={`url(#${`${gradientId}-3`})`}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M450 384C476.509 384 498 362.509 498 336C498 309.491 476.509 288 450 288C423.491 288 402 309.491 402 336C402 362.509 423.491 384 450 384Z"
        />
      </svg>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#177578',
            fontSize: '24px',
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          온세미로
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
      aria-label="온세미로 로고"
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
