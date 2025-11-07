import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from '@/components/iconify';

import { AssignmentModeSelector, type AssignmentMode } from './assignment-mode-selector';
import { CategoryAssignmentForm } from './category-assignment-form';
import { IndividualAssignmentForm } from './individual-assignment-form';

type UnifiedAssignmentModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
  // 프리셋 (다음 단계에서 사용)
  preselectedUserId?: number;
  preselectedGroupId?: number;
  preselectedQuestionIds?: number[];
  preselectedCategoryId?: number;
  forcedMode?: AssignmentMode;
};

export function UnifiedAssignmentModal({
  open,
  onClose,
  onComplete,
  preselectedUserId,
  preselectedGroupId,
  forcedMode,
}: UnifiedAssignmentModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedMode, setSelectedMode] = useState<AssignmentMode | null>(forcedMode || null);

  const handleClose = () => {
    if (!forcedMode) {
      setSelectedMode(null);
    }
    onClose();
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    handleClose();
  };

  const handleBack = () => {
    setSelectedMode(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: (themeArg) => `1px solid ${themeArg.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedMode && !forcedMode && (
            <IconButton onClick={handleBack} size="small">
              <Iconify icon="solar:arrow-left-linear" />
            </IconButton>
          )}
          <Iconify icon="solar:checklist-minimalistic-bold" sx={{ color: 'primary.main' }} />
          <Box>질문 할당</Box>
        </Box>
        <IconButton onClick={handleClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
        {!selectedMode && <AssignmentModeSelector onSelect={setSelectedMode} />}

        {selectedMode === 'user-individual' && (
          <IndividualAssignmentForm
            mode="user"
            preselectedUserId={preselectedUserId}
            onComplete={handleComplete}
            onCancel={handleClose}
          />
        )}

        {selectedMode === 'group-individual' && (
          <IndividualAssignmentForm
            mode="group"
            preselectedGroupId={preselectedGroupId}
            onComplete={handleComplete}
            onCancel={handleClose}
          />
        )}

        {selectedMode === 'user-category' && (
          <CategoryAssignmentForm
            mode="user"
            preselectedUserId={preselectedUserId}
            onComplete={handleComplete}
            onCancel={handleClose}
          />
        )}

        {selectedMode === 'group-category' && (
          <CategoryAssignmentForm
            mode="group"
            preselectedGroupId={preselectedGroupId}
            onComplete={handleComplete}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
