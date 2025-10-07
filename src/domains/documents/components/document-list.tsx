"use client";

import React, { useState, useCallback, useEffect } from "react";
import "../styles/documents.css";
import {
  Button,
  Tag,
  Pagination,
  InlineLoading,
  Tile,
  OverflowMenu,
  OverflowMenuItem,
} from "@carbon/react";
import {
  Add,
  Document as DocumentIcon,
  Download,
  View,
} from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { Document as DocumentType, DocumentQuery } from "../types/document";
import { useDocumentStore } from "../stores/document-store";
import DocumentService from "../services/document-service";
import { useDeleteDocument, useDocuments } from "../hooks/use-document-queries";
import ConfirmDeleteModal from '@/components/shared/confirm-delete-modal';
import { NotificationService } from '@/services/notification-service';

interface DocumentListProps {
  documents?: DocumentType[];
  onEdit?: (document: DocumentType) => void;
  onView?: (document: DocumentType) => void;
  onDownload?: (document: DocumentType) => void;
  onCreate?: () => void;
  statusFilter?: "all" | "draft" | "published" | "archived" | "expired";
  categoryFilter?: string;
  typeFilter?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents: propDocuments,
  onEdit,
  onView,
  onDownload,
  onCreate,
  statusFilter = "all",
  categoryFilter = "all",
  typeFilter = "all",
}) => {
  const t = useTranslations("documents");
  const [currentQuery, setCurrentQuery] = useState<DocumentQuery>({
    page: 1,
    limit: 12,
  });

  // Convert filters to backend query parameters with proper case handling
  const queryParams: Partial<DocumentQuery> = { ...currentQuery };
  if (statusFilter !== "all") {
    queryParams.status = statusFilter.toUpperCase() as any;
  }
  if (categoryFilter !== "all") {
    queryParams.category = categoryFilter.toUpperCase() as any;
  }
  if (typeFilter !== "all") {
    queryParams.documentType = typeFilter.toUpperCase() as any;
  }

  const queryResult = useDocuments(queryParams);
  const listData = queryResult.data;
  const isLoading = queryResult.isLoading;
  const pagination = listData?.pagination;

  const deleteMutation = useDeleteDocument();

  const safeDocuments: DocumentType[] = Array.isArray(propDocuments)
    ? propDocuments
    : Array.isArray(listData?.data)
      ? listData!.data
      : [];
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<DocumentType | null>(null);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentQuery((prev) => ({ ...prev, page: 1 }));
  }, [statusFilter, categoryFilter, typeFilter]);

  // Handle pagination
  const handlePageChange = useCallback(
    (page: number) => {
      const newQuery = { ...currentQuery, page };
      setCurrentQuery(newQuery);
    },
    [currentQuery]
  );

  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      const newQuery = { ...currentQuery, limit: pageSize, page: 1 };
      setCurrentQuery(newQuery);
    },
    [currentQuery]
  );

  // No client-side filtering since search is server-side
  const displayDocuments = safeDocuments;

  // Handle document download using presigned URL endpoints
  const handleDownload = useCallback(
    async (doc: DocumentType) => {
      try {
        console.log("📥 Getting download URL for document:", doc.id);
        // Try admin endpoint first, fallback to public if needed
        let presignedResponse;
        try {
          presignedResponse = await DocumentService.getAdminDownloadUrl(
            doc.id,
            86400
          ); // 24 hours expiry for download
        } catch (adminError) {
          console.log(
            "Admin download URL failed, trying public URL:",
            adminError
          );
          presignedResponse = await DocumentService.getPublicDownloadUrl(
            doc.id,
            86400
          );
        }

        if (presignedResponse?.downloadUrl) {
          console.log(
            "✅ Downloading with presigned URL:",
            presignedResponse.downloadUrl
          );
          const link = window.document.createElement("a");
          link.href = presignedResponse.downloadUrl;
          link.download =
            doc.originalName ||
            doc.fileName ||
            `document.${doc.documentType.toLowerCase()}`;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
        } else {
          console.warn(
            "No download URL in presigned response:",
            presignedResponse
          );
          // Fallback to direct downloadUrl if available
          if (doc.downloadUrl) {
            const link = window.document.createElement("a");
            link.href = doc.downloadUrl;
            link.download =
              doc.originalName ||
              doc.fileName ||
              `document.${doc.documentType.toLowerCase()}`;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
          }
        }
      } catch (error) {
        console.error("Failed to get download URL:", error);
        // Ultimate fallback
        if (doc.downloadUrl) {
          const link = window.document.createElement("a");
          link.href = doc.downloadUrl;
          link.download =
            doc.originalName ||
            doc.fileName ||
            `document.${doc.documentType.toLowerCase()}`;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
        } else if (onDownload) {
          onDownload(doc);
        } else {
          // Use centralized notification instead of native alert
          // Import NotificationService at top of file if not present
          NotificationService.showError("Unable to download document. Please try again.");
        }
      }
    },
    [onDownload]
  );

  return (
    <div className="document-list">
      {/* Content area */}
      {isLoading && safeDocuments.length === 0 ? (
        <div className="loading-container">
          <InlineLoading description={t("status.loading")} />
        </div>
      ) : (
        <>
          {/* Document Cards - Flex layout with wrapping */}
          {displayDocuments.length > 0 ? (
            <div className="document-flex">
              {displayDocuments.map((document: DocumentType) => {
                return (
                  <Tile
                    key={document.id}
                    className="document-card document-card--compact document-flex-item"
                  >
                    <div className="card-header">
                      {/* Document type icon */}
                      <div className="document-type-icon">
                        {DocumentService.getFileTypeIcon(document.documentType)}
                      </div>

                      {/* Status badge */}
                      <div className="status-badge">
                        <Tag
                          type={
                            DocumentService.getStatusColor(
                              document.status
                            ) as any
                          }
                          size="sm"
                        >
                          {t(`status.${document.status.toLowerCase()}`)}
                        </Tag>
                      </div>
                    </div>

                    {/* Overflow menu positioned at bottom-right of card */}
                    <div className="card-overflow-menu">
                      <OverflowMenu
                        flipped
                        size="sm"
                        aria-label={t("table.actions.menu")}
                      >
                        <OverflowMenuItem
                          itemText={t("table.actions.download")}
                          onClick={() => handleDownload(document)}
                        />
                        <OverflowMenuItem
                          hasDivider
                          isDelete
                          itemText={t("table.actions.delete")}
                          onClick={() => {
                            setDocToDelete(document);
                            setDeleteModalOpen(true);
                          }}
                        />
                      </OverflowMenu>
                    </div>

                    <div className="card-content card-content--compact">
                      <h3 className="card-title card-title--compact">
                        {document.title?.en ||
                          document.title?.ne ||
                          t("table.noTitle")}
                      </h3>

                      {document.description && (
                        <p className="card-description">
                          {document.description.en || document.description.ne}
                        </p>
                      )}

                      <div className="card-meta">
                        <div className="meta-row">
                          <Tag
                            type={
                              DocumentService.getCategoryColor(
                                document.category
                              ) as any
                            }
                            size="sm"
                          >
                            {t(`categories.${document.category.toLowerCase()}`)}
                          </Tag>
                          {/* <span className="file-size">
                            {DocumentService.formatFileSize(document.fileSize)}
                          </span> */}
                        </div>

                        {(document.documentNumber) && (
                          <div className="document-number">
                            {document.documentNumber &&
                              `${t("table.documentNumber")}: ${document.documentNumber}`}
                            {/* {document.documentNumber &&
                              document.version &&
                              " • "}
                            {document.version &&
                              `${t("table.version")}: ${document.version}`} */}
                          </div>
                        )}
                        {document.publishDate && (
                          <div className="document-publish-date">
                            {`${t("table.publishedDate", { default: "Published" })}: ${new Date(
                              document.publishDate
                            ).toLocaleDateString()}`}
                          </div>
                        )}
{/* 
                        <div className="download-count">
                          {t("table.downloads")}: {document.downloadCount}
                        </div> */}
                      </div>
                    </div>
                  </Tile>
                );
              })}
            </div>
          ) : (
            /* Improved Empty State following IBM Carbon Design Guidelines */
            <div className="empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">
                  <DocumentIcon size={48} />
                </div>
                <h3 className="empty-state-title">
                  {statusFilter !== "all" ||
                  categoryFilter !== "all" ||
                  typeFilter !== "all"
                    ? t("empty.filteredTitle")
                    : t("empty.title")}
                </h3>
                <p className="empty-state-description">
                  {statusFilter !== "all" ||
                  categoryFilter !== "all" ||
                  typeFilter !== "all"
                    ? t("empty.filteredMessage")
                    : t("empty.message")}
                </p>
                {onCreate && (
                  <Button
                    kind="primary"
                    renderIcon={Add}
                    onClick={onCreate}
                    className="empty-state-action"
                  >
                    {t("actions.createNew")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {(() => {
            const totalItems = pagination?.total ?? 0;
            const shouldShowPagination =
              totalItems > 0 && displayDocuments.length > 0;
            return shouldShowPagination ? (
              <div className="pagination-container">
                <Pagination
                  page={pagination!.page}
                  pageSize={pagination!.limit}
                  pageSizes={[12, 24, 48, 96]}
                  totalItems={totalItems}
                  onChange={({ page, pageSize }) => {
                    if (page !== undefined) {
                      handlePageChange(page);
                    }
                    if (pageSize !== undefined) {
                      handlePageSizeChange(pageSize);
                    }
                  }}
                  size="md"
                />
              </div>
            ) : null;
          })()}

          <ConfirmDeleteModal
            open={deleteModalOpen}
            title={"Confirm Deletion"}
            subtitle={docToDelete ? `Are you sure you want to delete "${docToDelete.title?.en || docToDelete?.originalName || 'this document'}"? This action cannot be undone.` : undefined}
            onConfirm={() => {
              if (docToDelete) deleteMutation.mutate(docToDelete.id);
              setDeleteModalOpen(false);
              setDocToDelete(null);
            }}
            onCancel={() => {
              setDeleteModalOpen(false);
              setDocToDelete(null);
            }}
      />
      </>
    )}
    </div>
  );
};
