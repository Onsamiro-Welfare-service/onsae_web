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

type AdminDetailModalProps = {
  open: boolean;
  onClose: () => void;
  admin: any;
};

export function AdminDetailModal({ open, onClose, admin }: AdminDetailModalProps) {
  if (!admin) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      {/* 헤더 */}
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            관리자 상세 정보
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'grey.500' }}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0, p: 0 }}>
        {/* 관리자 기본 정보 섹션 */}
        <Box sx={{ bgcolor: '#fafafa', p: 3, borderBottom: '1px solid #e6e6e6' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 20, mb: 2 }}>
            {admin.name}
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
            소속 복지관: {admin.welfareCenter}
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
            이메일: {admin.email}
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
            권한: {admin.role} | 부서: 행정팀 | 직급: 팀장
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#1a991a', fontSize: 14, fontWeight: 500 }}>
            상태: {admin.status === 'active' ? '활성' : '비활성'} | 최근 로그인: {admin.lastLogin}
          </Typography>
        </Box>

        {/* 관리자 활동 정보 섹션 */}
        <Box sx={{ bgcolor: '#fafafa', p: 3, borderBottom: '1px solid #e6e6e6' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
            📊 관리자 활동 정보
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
            임명일: 2024-01-15 | 계약기간: 2024-01-15 ~ 2025-01-14
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
            연락처: 010-1234-5678 | 팩스: 02-1234-5679
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
            주소: 서울시 강남구 테헤란로 123, 강남빌딩 5층
          </Typography>
        </Box>

        {/* 권한 및 접근 정보 섹션 */}
        <Box sx={{ bgcolor: '#fafafa', p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
            🔐 권한 및 접근 정보
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* 권한 카드 */}
            <Card sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #cccccc', flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
                🔑 관리 권한
              </Typography>
              <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
                • 사용자 관리
              </Typography>
              <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
                • 질문 관리
              </Typography>
              <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
                • 응답 관리
              </Typography>
              <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14 }}>
                • 업로드 관리
              </Typography>
            </Card>

            {/* 접근 로그 카드 */}
            <Card sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #cccccc', flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16, mb: 1 }}>
                📝 최근 활동
              </Typography>
              <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
                • 마지막 로그인: {admin.lastLogin}
              </Typography>
              <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
                • 이번 주 로그인: 5회
              </Typography>
              <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14, mb: 1 }}>
                • 마지막 활동: 사용자 관리
              </Typography>
              <Typography variant="body2" sx={{ color: '#4d4d4d', fontSize: 14 }}>
                • 총 관리 작업: 127건
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
              startIcon={<Iconify icon="eva:refresh-outline" />}
              size="small"
            >
              상태 변경
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:shield-outline" />}
              size="small"
            >
              권한 수정
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="eva:key-outline" />}
              size="small"
            >
              비밀번호 재설정
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