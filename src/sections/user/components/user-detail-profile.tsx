'use client';
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';
import { userService, type UpdateProfileRequest } from '@/services/userService';

import type { UserProps } from '../user-table-row';

type UserDetailProfileProps = {
  user: UserProps;
};

type ProfileData = UpdateProfileRequest;

const severityOptions = [
  { value: 'MILD', label: '경증', color: 'success' },
  { value: 'MODERATE', label: '중등도', color: 'warning' },
  { value: 'SEVERE', label: '중증', color: 'error' },
];

const relationshipOptions = [
  '배우자',
  '자녀',
  '부모',
  '형제자매',
  '친척',
  '지인',
  '기타',
];

export function UserDetailProfile({ user }: UserDetailProfileProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    phone: '',
    address: '',
    birthDate: '',
    severity: 'MILD',
    guardianName: '',
    guardianRelationship: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianAddress: '',
    emergencyContacts: {},
    careNotes: '',
  });

  // 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserProfile(Number(user.id));
        
        setProfileData({
          name: response.name || '',
          phone: response.phone || '',
          address: response.address || '',
          birthDate: response.birthDate || '',
          severity: response.severity || 'MILD',
          guardianName: response.guardianName || '',
          guardianRelationship: response.guardianRelationship || '',
          guardianPhone: response.guardianPhone || '',
          guardianEmail: response.guardianEmail || '',
          guardianAddress: response.guardianAddress || '',
          emergencyContacts: response.emergencyContacts || {},
          careNotes: response.careNotes || '',
        });
      } catch (error) {
        console.error('프로필 로드 실패:', error);
        // 에러 발생 시 기본값으로 설정
        setProfileData({
          name: '',
          phone: '',
          address: '',
          birthDate: '',
          severity: 'MILD',
          guardianName: '',
          guardianRelationship: '',
          guardianPhone: '',
          guardianEmail: '',
          guardianAddress: '',
          emergencyContacts: {},
          careNotes: '',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user.id]);

  const handleInputChange = (field: keyof ProfileData, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 에러 상태 초기화
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }
    
    if (!profileData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else if (!/^010-\d{4}-\d{4}$/.test(profileData.phone)) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요. (010-1234-5678)';
    }
    
    if (profileData.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.guardianEmail)) {
      newErrors.guardianEmail = '올바른 이메일 형식을 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      await userService.updateUserProfile(Number(user.id), profileData);
      
      // 성공 메시지 표시
      alert('개인정보가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      alert('개인정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          프로필 정보를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h6'} sx={{ fontWeight: 700, mb: 0.5 }}>
            개인정보 변경
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            사용자의 개인정보를 수정하고 관리하세요
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{ borderRadius: 2 }}
          startIcon={<Iconify icon="solar:diskette-bold" />}
        >
          {saving ? '저장 중...' : '저장'}
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* 기본 정보 */}
        <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Iconify icon="solar:user-bold" sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  기본 정보
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="이름"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  variant="outlined"
                  size="small"
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
                
                <TextField
                  fullWidth
                  label="전화번호"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="010-1234-5678"
                  error={!!errors.phone}
                  helperText={errors.phone}
                  required
                />
                
                <TextField
                  fullWidth
                  label="주소"
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                />
                
                <TextField
                  fullWidth
                  label="생년월일"
                  type="date"
                  value={profileData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                
                <FormControl fullWidth size="small">
                  <InputLabel>중증도</InputLabel>
                  <Select
                    value={profileData.severity}
                    onChange={(e) => handleInputChange('severity', e.target.value)}
                    label="중증도"
                  >
                    {severityOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={option.label} 
                            size="small" 
                            color={option.color as 'success' | 'warning' | 'error'}
                            sx={{ minWidth: 60 }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>

        {/* 보호자 정보 */}
        <Card sx={{ height: 'fit-content' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Iconify icon="solar:shield-user-bold" sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                보호자 정보
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="보호자 이름"
                value={profileData.guardianName}
                onChange={(e) => handleInputChange('guardianName', e.target.value)}
                variant="outlined"
                size="small"
              />
              
              <FormControl fullWidth size="small">
                <InputLabel>관계</InputLabel>
                <Select
                  value={profileData.guardianRelationship}
                  onChange={(e) => handleInputChange('guardianRelationship', e.target.value)}
                  label="관계"
                >
                  {relationshipOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="보호자 전화번호"
                value={profileData.guardianPhone}
                onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                variant="outlined"
                size="small"
                placeholder="010-1234-5678"
              />
              
              <TextField
                fullWidth
                label="보호자 이메일"
                type="email"
                value={profileData.guardianEmail}
                onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                variant="outlined"
                size="small"
                placeholder="guardian@example.com"
                error={!!errors.guardianEmail}
                helperText={errors.guardianEmail}
              />
              
              <TextField
                fullWidth
                label="보호자 주소"
                value={profileData.guardianAddress}
                onChange={(e) => handleInputChange('guardianAddress', e.target.value)}
                variant="outlined"
                size="small"
                multiline
                rows={2}
              />
            </Box>
          </CardContent>
        </Card>

        {/* 돌봄 노트 */}
        <Card sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Iconify icon="solar:notes-bold" sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                돌봄 노트
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              label="돌봄 관련 특이사항 및 노트"
              value={profileData.careNotes}
              onChange={(e) => handleInputChange('careNotes', e.target.value)}
              variant="outlined"
              multiline
              rows={4}
              placeholder="환자의 특이사항, 주의사항, 돌봄 방법 등을 기록하세요..."
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
