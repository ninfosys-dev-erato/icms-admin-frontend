"use client";

import {
  Add,
  Archive,
  Document,
  Download,
  Image,
  Radio,
  TrashCan,
  Video
} from "@carbon/icons-react";
import {
  Button,
  ComboBox,
  FormGroup,
  Pagination,
  Stack,
  Tag,
  Tile
} from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";
import { useAttachmentsWithPresignedUrls, useSimpleCreateAttachment, useSimpleDeleteAttachment, useDownloadAttachment } from "../../hooks/use-attachment-queries";
import { useAdminContents } from "../../hooks/use-content-queries";
import { AttachmentNotificationService } from "../../services/attachment-notification-service";
import { AttachmentService } from "../../services/attachment-service";
import { useAttachmentStore } from "../../stores/attachment-store";
import "../../styles/content-management.css";
import { ContentAttachment } from "../../types/attachment";
import { AttachmentPreview } from "./attachment-preview";

interface AttachmentListProps {
  className?: string;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ className }) => {
  const t = useTranslations("content-management");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh key
  
  const {
    selectedContentId,
    setSelectedContentId,
  } = useAttachmentStore();

  // Get content list for selector
  const { data: contentResponse } = useAdminContents({ page: 1, limit: 100 });
  const contents = contentResponse?.data || [];

  // Get attachments for selected content with presigned URLs
  const { 
    data: attachmentsResponse, 
    isLoading, 
    error,
    refetch
  } = useAttachmentsWithPresignedUrls(selectedContentId || "", 86400, !!selectedContentId);

  // Debug logging to understand data structure
  console.log('🔍 AttachmentList - Raw attachmentsResponse:', attachmentsResponse);
  console.log('🔍 AttachmentList - Response type:', typeof attachmentsResponse);
  console.log('🔍 AttachmentList - Is array:', Array.isArray(attachmentsResponse));

  // Extract attachments from response, with fallback to empty array
  const attachments = Array.isArray(attachmentsResponse) ? attachmentsResponse : [];
  console.log('🔍 AttachmentList - Final attachments array:', attachments);
  console.log('🔍 AttachmentList - Attachments count:', attachments.length);
  
  // Force refresh function
  const forceRefresh = useCallback(async () => {
    console.log('🔄 Forcing manual refresh...');
    setRefreshKey(prev => prev + 1);
    await refetch();
  }, [refetch]);
  // Paginate attachments for card grid display
  const paginatedAttachments = attachments.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize);

  const deleteMutation = useSimpleDeleteAttachment();
  const downloadMutation = useDownloadAttachment();
  const createAttachmentMutation = useSimpleCreateAttachment();

  // Format file name to show first 8 characters + extension
  const formatFileName = (fileName: string): string => {
    const lastDotIndex = fileName.lastIndexOf('.');
    const extension = lastDotIndex > -1 ? fileName.substring(lastDotIndex) : '';
    const nameWithoutExt = lastDotIndex > -1 ? fileName.substring(0, lastDotIndex) : fileName;
    
    if (nameWithoutExt.length <= 8) {
      return fileName;
    }
    
    return `${nameWithoutExt.substring(0, 8)}.....${extension}`;
  };

  // Content selection items for ComboBox
  const contentItems = contents.map(content => ({
    id: content.id,
    title: content.title?.en || content.title?.ne || `Content ${content.id}`,
    description: content.excerpt?.en || content.excerpt?.ne || content.seoDescription?.en || content.seoDescription?.ne || '',
  }));

  // Handle content selection
  const handleContentSelection = useCallback((selection: any) => {
    if (selection?.selectedItem) {
      setSelectedContentId(selection.selectedItem.id);
      setCurrentPage(1); // Reset to first page when content changes
    }
  }, [setSelectedContentId]);

  // Handle attachment actions
  const handleEdit = useCallback((attachment: ContentAttachment) => {
    // Edit not implemented yet — show informational notification instead of native prompt
    AttachmentNotificationService.showInfo('Edit functionality will be implemented here');
  }, [deleteMutation]);

  const handleDelete = useCallback((attachment: ContentAttachment) => {
    AttachmentNotificationService.showDeleteConfirmation(
      attachment.fileName,
      () => {
        deleteMutation.mutate(attachment.id, {
          onSuccess: () => {
            AttachmentNotificationService.showAttachmentDeleted(attachment.fileName);
            // Force manual refresh to ensure UI updates
            setTimeout(() => forceRefresh(), 100);
          },
          onError: (error: any) => {
            const errorMessage = error?.message || 'Unknown error occurred';
            AttachmentNotificationService.showAttachmentDeletionError(errorMessage, attachment.fileName);
          }
        });
      }
    );
  }, [deleteMutation]);

  const handleDownload = useCallback((attachment: ContentAttachment) => {
    downloadMutation.mutate(attachment.id, {
      onSuccess: () => {
        AttachmentNotificationService.showAttachmentDownloaded(attachment.fileName);
      },
      onError: (error: any) => {
        const errorMessage = error?.message || 'Unknown error occurred';
        AttachmentNotificationService.showAttachmentDownloadError(errorMessage, attachment.fileName);
      }
    });
  }, [downloadMutation]);

  const handleCreateNew = useCallback(() => {
    if (selectedContentId) {
      // Create a hidden file input and trigger it directly
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      fileInput.accept = 'image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv,.xml,.json,.zip,.rar,.7z,.tar,.gz';
      
      fileInput.onchange = async (event) => {
        const files = Array.from((event.target as HTMLInputElement).files || []);
        if (files.length > 0) {
          // Handle file uploads directly here
          await handleDirectFileUpload(files);
        }
        // Clean up
        document.body.removeChild(fileInput);
      };
      
      // Add to DOM temporarily and trigger
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      fileInput.click();
    }
  }, [selectedContentId]);

  // Handle direct file uploads without opening the panel
  const handleDirectFileUpload = async (files: File[]) => {
    // If no content is selected, show a message to select content first
    if (!selectedContentId) {
      AttachmentNotificationService.showSelectContentFirst();
      return;
    }
    
    // Validate files first
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    files.forEach((file, index) => {
      const validation = AttachmentService.validateFile(file);
      if (!validation.isValid) {
        AttachmentNotificationService.showFileValidationError(file.name, validation.error || "Invalid file");
        errors.push(file.name);
      } else {
        validFiles.push(file);
      }
    });
    
    if (validFiles.length === 0) return;
    
    // Show uploading notification
    let loadingNotificationId: string | null = null;
    if (validFiles.length === 1 && validFiles[0]) {
      loadingNotificationId = AttachmentNotificationService.showUploadingFile(validFiles[0].name);
    } else if (validFiles.length > 1) {
      loadingNotificationId = AttachmentNotificationService.showUploadingMultipleFiles(validFiles.length);
    }
    
    try {
      // Upload each file
      for (const file of validFiles) {
        await createAttachmentMutation.mutateAsync({
          data: {
            contentId: selectedContentId,
            fileName: file.name,
            filePath: '', // This will be set by the backend
            fileSize: file.size,
            mimeType: file.type,
            order: 1,
            originalName: file.name,
            altText: '',
            description: ''
          },
          file: file
        });
      }
      
      // Remove loading notification
      if (loadingNotificationId) {
        AttachmentNotificationService.removeNotification(loadingNotificationId);
      }
      
      // Show success message
      if (validFiles.length === 1 && validFiles[0]) {
        AttachmentNotificationService.showAttachmentUploaded(validFiles[0].name);
      } else if (validFiles.length > 1) {
        AttachmentNotificationService.showMultipleAttachmentsUploaded(validFiles.length);
      }

      // Force manual refresh to ensure UI updates
      setTimeout(() => forceRefresh(), 100);
      
    } catch (error) {
      // Remove loading notification
      if (loadingNotificationId) {
        AttachmentNotificationService.removeNotification(loadingNotificationId);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      if (validFiles.length === 1 && validFiles[0]) {
        AttachmentNotificationService.showAttachmentUploadError(errorMessage, validFiles[0].name);
      } else {
        AttachmentNotificationService.showAttachmentUploadError(errorMessage);
      }
    }
  };

  // Handle file selection from the Basic Info section
  const handleFileSelection = useCallback((files: File[]) => {
    if (files.length > 0) {
      handleDirectFileUpload(files);
    }
  }, [handleDirectFileUpload]);

  // Render attachments as a responsive card grid (instead of table)
  const renderAttachmentCards = () => {
    if (!attachments || attachments.length === 0) {
      return (
        <div className="empty-state">
          <div>
            <h4 className="empty-title">{t('attachments.empty.title', { default: 'No attachments' })}</h4>
            <p className="empty-desc">{t('attachments.empty.description', { default: 'No attachments are available for this content.' })}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="media-flex">
        {attachments.map((attachment: ContentAttachment) => (
          <div key={attachment.id} className="media-flex-item">
            <div className="media-card">
              <div className="card-image">
                <AttachmentPreview attachment={attachment} className="media-card-preview" showActions={false} />
              </div>
                <div className="card-content">
                <div className="card-title" title={attachment.fileName}>{attachment.fileName}</div>
                <div className="media-card__meta">
                  <span className="file-size">{AttachmentService.formatFileSize(attachment.fileSize)}</span>
                  <Tag type="blue" size="sm" className="meta-tag">{AttachmentService.getFileTypeCategory(attachment.mimeType)}</Tag>
                </div>
                <div className="card-actions">
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Download}
                    iconDescription={t('attachments.table.actionItems.download', { default: 'Download' })}
                    onClick={() => handleDownload(attachment)}
                  />

                  <Button
                    kind="danger--ghost"
                    size="sm"
                    renderIcon={TrashCan}
                    iconDescription={t('attachments.table.actionItems.delete', { default: 'Delete' })}
                    onClick={() => handleDelete(attachment)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to get file icon
  const getFileIcon = (mimeType: string) => {
    const iconSize = 24;
    switch (AttachmentService.getFileTypeCategory(mimeType)) {
      case 'image':
        return <Image size={iconSize} />;
      case 'video':
        return <Video size={iconSize} />;
      case 'audio':
        return <Radio size={iconSize} />;
      case 'archive':
        return <Archive size={iconSize} />;
      default:
        return <Document size={iconSize} />;
    }
  };

  return (
    <div className={`attachment-list ${className || ''}`}>
      {/* Content Selection */}
      <div className="content-selection-section">
        <div className="content-selector">
          <ComboBox
            id="content-selector"
            items={contentItems}
            itemToString={(item) => item?.title || ''}
            onChange={handleContentSelection}
            placeholder={t('attachments.contentSelector.placeholder', { default: 'Select content to manage attachments...' })}
            size="lg"
            titleText={t('attachments.contentSelector.title', { default: 'Select Content' })}
            helperText={t('attachments.contentSelector.help', { default: 'Choose the content item to manage its attachments' })}
          />
        </div>
        
        {selectedContentId && (
          <Button
            size="lg"
            renderIcon={Add}
            iconDescription={t('attachments.actions.upload', { default: 'Upload Files' })}
            onClick={handleCreateNew}
            kind="primary"
          >
            {t('attachments.actions.upload', { default: 'Upload Files' })}
          </Button>
        )}
      </div>

      {/* Attachments Display */}
      {selectedContentId ? (
        <div className="attachments-display">
          {/* Persistent Upload Button */}
          <div className="upload-section">
            <div className="attachment-upload-form media-multi-upload">
              {/* Basic Info Section */}
              <div className="form-section">
                <h3 className="section-title">Basic Info</h3>
                <div className="file-upload-area">
                  <FormGroup legendText="File(s)">
                    <Tile className={`upload-area ${selectedContentId ? 'upload-area--enabled' : 'upload-area--disabled'}`}>
                      <Stack gap={4} className="upload-content">
                        <Document size={32} className="upload-icon" />
                        <p className="upload-heading">File(s)</p>
                        <p className="upload-subtext">
                          {selectedContentId 
                            ? 'Documents, images, audio files, archives (max 20MB)' 
                            : 'Please select a content item first, then upload files'
                          }
                        </p>
                        <input
                          id="attachment-file-input"
                          type="file"
                          multiple
                          accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv,.xml,.json,.zip,.rar,.7z,.tar,.gz"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              handleFileSelection(files);
                            }
                          }}
                          disabled={!selectedContentId}
                        />
                        <Button
                          kind="secondary"
                          size="sm"
                          onClick={() => document.getElementById('attachment-file-input')?.click()}
                          renderIcon={Add}
                          iconDescription="Choose files to upload"
                          disabled={!selectedContentId}
                          className="choose-files-button"
                        >
                          {selectedContentId ? 'Choose files' : 'Select content first'}
                        </Button>
                      </Stack>
                    </Tile>
                  </FormGroup>
                </div>
              </div>
            </div>
          </div>

          {attachments.length > 0 ? (
            <>
              <div className="attachments-cards">
                <div className="media-flex">
                  {paginatedAttachments.map((attachment: ContentAttachment) => (
                    <div key={attachment.id} className="media-flex-item">
                      <div className="media-card">
                        <div className="card-image">
                          <AttachmentPreview attachment={attachment} className="media-card-preview" showActions={false} />
                        </div>
                        <div className="card-content">
                          <div className="card-title truncated" title={attachment.fileName}>{formatFileName(attachment.fileName)}</div>
                          <div className="card-action-row">
                            <Button
                              kind="ghost"
                              size="sm"
                              renderIcon={Download}
                              iconDescription={t('attachments.table.actionItems.download', { default: 'Download' })}
                              onClick={() => handleDownload(attachment)}
                              title="Download"
                            />
                            <Button
                              kind="danger--ghost"
                              size="sm"
                              renderIcon={TrashCan}
                              iconDescription={t('attachments.table.actionItems.delete', { default: 'Delete' })}
                              // hasIconOnly  
                              onClick={() => handleDelete(attachment)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {attachments.length > pageSize && (
                <div className="pagination-container">
                  <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    pageSizes={[12, 24, 48]}
                    totalItems={attachments.length}
                    onChange={({ page, pageSize: newPageSize }) => {
                      if (page !== undefined) setCurrentPage(page);
                      if (newPageSize !== undefined) setPageSize(newPageSize);
                    }}
                    size="md"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <Tile className="empty-tile">
                <div className="empty-content">
                  <Document size={48} className="empty-icon" />
                  <h3>{t('attachments.empty.title', { default: 'No Attachments' })}</h3>
                  <p>{t('attachments.empty.message', { default: 'This content has no attachments yet. Upload some files to get started.' })}</p>
                </div>
              </Tile>
            </div>
          )}
        </div>
      ) : (
        <div className="no-content-selected">
          <Tile className="no-content-tile">
            <div className="no-content-content">
              <Document size={48} className="no-content-icon" />
              <h3>{t('attachments.noContent.title', { default: 'Select Content' })}</h3>
              <p>{t('attachments.noContent.message', { default: 'Please select a content item from the dropdown above to manage its attachments.' })}</p>
            </div>
          </Tile>
        </div>
      )}

      {/* Upload Panel - Removed since we handle uploads directly */}
      {/* {panelOpen && (
        <AttachmentUpload />
      )} */}
    </div>
  );
};
