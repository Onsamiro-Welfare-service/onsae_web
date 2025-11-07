import type { IconButtonProps } from '@mui/material/IconButton';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import CircularProgress from '@mui/material/CircularProgress';

import { fToNow } from '@/utils/format-time';

import { Iconify } from '@/components/iconify';
import { Scrollbar } from '@/components/scrollbar';
import { uploadService } from '@/services/uploadService';

import type { UploadListResponse } from '@/types/api';

// ----------------------------------------------------------------------

export type NotificationsPopoverProps = IconButtonProps & {
  onNotificationClick?: (uploadId: number) => void;
};

const POLLING_INTERVAL = 30000; // 30초마다 업데이트
const NOTIFICATION_LIMIT = 20; // 알림 최대 개수
const READ_MESSAGES_DISPLAY_LIMIT = 5; // 읽은 메시지 표시 개수
export function NotificationsPopover({ sx, onNotificationClick, ...other }: NotificationsPopoverProps) {
  const router = useRouter();
  const [uploads, setUploads] = useState<UploadListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 읽지 않은 메시지 목록 조회
  const fetchNotifications = useCallback(async () => {
    // 이미 로딩 중이면 중복 호출 방지
    if (isLoading) return;
    try {
      setIsLoading(true);
      const data = await uploadService.getUploads(NOTIFICATION_LIMIT, 0);
      setUploads(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드 및 주기적 업데이트
  useEffect(() => {
    fetchNotifications();

    // 30초마다 업데이트
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
    }, POLLING_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchNotifications]);

  // 팝오버가 열릴 때마다 최신 데이터 가져오기
  useEffect(() => {
    if (openPopover) {
      fetchNotifications();
    }
  }, [openPopover, fetchNotifications]);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // 알림 클릭 핸들러
  const handleNotificationClick = useCallback(
    (upload: UploadListResponse) => {
      handleClosePopover();
      
      // 부모 컴포넌트에 알림 클릭 이벤트 전달 (모달 열기용)
      if (onNotificationClick) {
        onNotificationClick(upload.id);
      } else {
        // 기본 동작: 메시지 페이지로 이동
        router.push(`/uploads?uploadId=${upload.id}`);
      }
    },
    [router, handleClosePopover, onNotificationClick]
  );

  // "View all" 클릭 핸들러
  const handleViewAll = useCallback(() => {
    router.push('/uploads');
    handleClosePopover();
  }, [router, handleClosePopover]);

  // 읽지 않은 메시지 (adminRead === false)
  const unreadUploads = uploads.filter((upload) => !upload.adminRead);
  // 읽은 메시지 (adminRead === true)
  const readUploads = uploads.filter((upload) => upload.adminRead);
  const unreadCount = unreadUploads.length;

  return (
    <>
      <IconButton
        color={openPopover ? 'primary' : 'default'}
        onClick={handleOpenPopover}
        sx={sx}
        {...other}
      >
        <Badge badgeContent={unreadCount > 0 ? unreadCount : 0} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box
          sx={{
            py: 2,
            pl: 2.5,
            pr: 1.5,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">알림</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              읽지 않은 메시지 {unreadCount}개
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Scrollbar fillContent sx={{ minHeight: 240, maxHeight: { xs: 360, sm: 'none' } }}>
            {unreadUploads.length > 0 && (
              <List
                disablePadding
                subheader={
                  <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                    새 메시지
                  </ListSubheader>
                }
              >
                {unreadUploads.map((upload) => (
                  <NotificationItem
                    key={upload.id}
                    upload={upload}
                    onClick={() => handleNotificationClick(upload)}
                  />
                ))}
              </List>
            )}

            {readUploads.length > 0 && (
              <List
                disablePadding
                subheader={
                  <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                    읽은 메시지
                  </ListSubheader>
                }
              >
                {readUploads.slice(0, READ_MESSAGES_DISPLAY_LIMIT).map((upload) => (
                  <NotificationItem
                    key={upload.id}
                    upload={upload}
                    onClick={() => handleNotificationClick(upload)}
                  />
                ))}
              </List>
            )}

            {uploads.length === 0 && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  알림이 없습니다
                </Typography>
              </Box>
            )}
          </Scrollbar>
        )}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple color="inherit" onClick={handleViewAll}>
            전체 보기
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

type NotificationItemProps = {
  upload: UploadListResponse;
  onClick: () => void;
};

function NotificationItem({ upload, onClick }: NotificationItemProps) {
  const title = (
    <Typography variant="subtitle2">
      {upload.userName || '알 수 없음'}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {upload.title || upload.contentPreview || '새 메시지'}
      </Typography>
    </Typography>
  );

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(!upload.adminRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              gap: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify width={14} icon="solar:clock-circle-outline" />
            {fToNow(upload.createdAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}
