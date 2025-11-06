import { apiClient } from './api';

/**
 * 파일 서비스
 * 파일 조회, 다운로드, 경로 접근 기능 제공
 */
export const fileService = {

  /**
   * 파일 다운로드
   * GET /api/files/{fileId}/download
   * @param fileId 파일 ID
   * @param fileName 다운로드할 파일명 (선택사항)
   */
  // async downloadFile(fileId: number, fileName?: string): Promise<void> {
  //   try {
  //     const blob = await apiClient.get<Blob>(`/files/${fileId}/download`);
      
  //     // Blob으로 변환하여 다운로드
  //     const downloadUrl = window.URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = downloadUrl;
  //     link.download = fileName || `file_${fileId}`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(downloadUrl);
  //   } catch (error) {
  //     console.error('File download error:', error);
  //     throw error;
  //   }
  // },

  getFileUrl(fileId: number): string {
    console.log(apiClient.baseURL);
    return `${apiClient.baseURL}/files/${fileId}`;
  },
};

