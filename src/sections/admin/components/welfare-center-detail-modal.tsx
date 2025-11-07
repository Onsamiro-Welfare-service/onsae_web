import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from '@/components/iconify';

// ----------------------------------------------------------------------

type WelfareCenterDetailModalProps = {
  open: boolean;
  onClose: () => void;
  welfareCenter: any;
};

export function WelfareCenterDetailModal({ open, onClose, welfareCenter }: WelfareCenterDetailModalProps) {
  if (!welfareCenter) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      {/* 헤더 */}
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            복지관 상세 정보
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'grey.500' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, p: 0 }}>
        {/* 복지관 기본 정보 섹션 */}
        <Box sx={{ bgcolor: '#fafafa', p: 3, borderBottom: '1px solid #e6e6e6' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 20, mb: 2 }}>
            {welfareCenter.name}
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
            주소: {welfareCenter.address}
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
            연락처: 02-1234-5678 | 팩스: 02-1234-5679
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
            이메일: gangnam@welfare.go.kr | 홈페이지: www.gangnam-welfare.kr
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#1a991a', fontSize: 14, fontWeight: 500 }}>
            상태: 활성 | 등록일: {welfareCenter.registeredAt} | 승인일: 2024-01-16
          </Typography>
        </Box>

        {/* 관리자 정보 섹션 */}
        <Box sx={{ bgcolor: '#fafafa', p: 3, borderBottom: '1px solid #e6e6e6' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
            👤 관리자 정보
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
            {welfareCenter.admin} (관리자 ID: ADMIN001)
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
            연락처: 010-1234-5678 | 이메일: admin@gangnam-welfare.kr
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
            권한: 복지관 관리자 | 부서: 행정팀 | 직급: 팀장
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#1a991a', fontSize: 14, fontWeight: 500 }}>
            상태: 활성 | 최근 로그인: 2024-01-20 14:30
          </Typography>
        </Box>

        {/* 통계 정보 섹션 */}
        <Box sx={{ bgcolor: '#fafafa', p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, mb: 3 }}>
            📊 복지관 운영 통계
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* 사용자 통계 카드 */}
            <Card sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #cccccc', flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
                👥 등록 사용자
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: 32, color: 'primary.main', mb: 1 }}>
                {welfareCenter.userCount}명
              </Typography>
              <Typography variant="caption" sx={{ color: '#4d4d4d', fontSize: 12 }}>
                이번 달 +3명 증가
              </Typography>
            </Card>

            {/* 질문 통계 카드 */}
            <Card sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #cccccc', flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
                ❓ 등록 질문
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: 32, color: 'primary.main', mb: 1 }}>
                28개
              </Typography>
              <Typography variant="caption" sx={{ color: '#4d4d4d', fontSize: 12 }}>
                이번 주 +2개 추가
              </Typography>
            </Card>

            {/* 응답 통계 카드 */}
            <Card sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #cccccc', flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
                📝 총 응답
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: 32, color: 'primary.main', mb: 1 }}>
                1,245개
              </Typography>
              <Typography variant="caption" sx={{ color: '#4d4d4d', fontSize: 12 }}>
                이번 주 +89개 증가
              </Typography>
            </Card>

            {/* 업로드 통계 카드 */}
            <Card sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #cccccc', flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
                📤 총 업로드
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: 32, color: 'primary.main', mb: 1 }}>
                156개
              </Typography>
              <Typography variant="caption" sx={{ color: '#4d4d4d', fontSize: 12 }}>
                이번 주 +12개 증가
              </Typography>
            </Card>
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:person-outline" />}
              size="small"
            >
              관리자 변경
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:refresh-outline" />}
              size="small"
            >
              상태 변경
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:bar-chart-outline" />}
              size="small"
            >
              상세 통계
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={onClose}>
              닫기
            </Button>
            <Button variant="contained" onClick={onClose}>
              저장
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}