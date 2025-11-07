import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';

export type AssignmentMode =
  | 'user-individual'
  | 'user-category'
  | 'group-individual'
  | 'group-category';

type AssignmentModeSelectorProps = {
  onSelect: (mode: AssignmentMode) => void;
};

const modes = [
  {
    mode: 'user-individual' as AssignmentMode,
    icon: 'solar:user-bold',
    title: '개별 사용자',
    subtitle: '한 명에게 개별 질문 할당',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
  {
    mode: 'group-individual' as AssignmentMode,
    icon: 'solar:users-group-rounded-bold',
    title: '사용자 그룹',
    subtitle: '여러 명에게 개별 질문 할당',
    color: 'secondary.main',
    bgColor: 'secondary.lighter',
  },
  {
    mode: 'user-category' as AssignmentMode,
    icon: 'solar:user-plus-bold',
    title: '개별 + 카테고리',
    subtitle: '한 명에게 카테고리 전체 할당',
    color: 'info.main',
    bgColor: 'info.lighter',
  },
  {
    mode: 'group-category' as AssignmentMode,
    icon: 'solar:users-group-two-rounded-bold',
    title: '그룹 + 카테고리',
    subtitle: '여러 명에게 카테고리 전체 할당',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
];

export function AssignmentModeSelector({ onSelect }: AssignmentModeSelectorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box>
      <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
        질문 할당 방식 선택
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>
        어떤 방식으로 질문을 할당하시겠습니까?
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 2,
        }}
      >
        {modes.map((modeConfig) => (
          <Card
            key={modeConfig.mode}
            onClick={() => onSelect(modeConfig.mode)}
            sx={{
              p: 3,
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: (themeArg) => `2px solid ${themeArg.palette.divider}`,
              '&:hover': {
                borderColor: modeConfig.color,
                boxShadow: 4,
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  bgcolor: modeConfig.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon={modeConfig.icon} width={32} sx={{ color: modeConfig.color }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {modeConfig.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {modeConfig.subtitle}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
