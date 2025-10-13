"use client";

import React, { useCallback } from "react";
import { Grid, Button, InlineLoading } from "@carbon/react";
import { Image, Add } from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { HeaderConfig } from "../types/header";
import {
  useHeaders,
  useDeleteHeader,
  usePublishHeader,
  useUnpublishHeader,
} from "../hooks/use-header-queries";
import { useHeaderStore } from "../stores/header-store";
import HeaderCard from "./header-card";
import ConfirmDeleteModal from '@/components/shared/confirm-delete-modal';
import { HeaderService } from '../services/header-service';
import { HeaderNotificationService } from '../services/header-notification-service';

interface HeaderListProps {
  headers?: HeaderConfig[];
  onEdit?: (header: HeaderConfig) => void;
  onView?: (header: HeaderConfig) => void;
  onPreview?: (header: HeaderConfig) => void;
  onCreate?: () => void;
  statusFilter?: "all" | "active" | "inactive" | "published" | "unpublished";
  className?: string;
}



export const HeaderList: React.FC<HeaderListProps> = ({
  headers: propHeaders,
  onEdit,
  onView,
  onPreview,
  onCreate,
  statusFilter = "all",
  className = "",
}) => {
  const t = useTranslations("headers");
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [headerToDelete, setHeaderToDelete] = React.useState<HeaderConfig | null>(null);
  const { openEditPanel } = useHeaderStore();
  const { openCreatePanel } = useHeaderStore();
  const handleCreateNew = () => openCreatePanel();
  const {
    data: headersData,
    isLoading,
    error,
  } = useHeaders({
    page: 1,
    limit: 1,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
  });

  const deleteHeaderMutation = useDeleteHeader();
  const publishHeaderMutation = usePublishHeader();
  const unpublishHeaderMutation = useUnpublishHeader();

  const header = headersData?.data?.[0] || propHeaders?.[0];

  const handleEdit = useCallback(
    (header: HeaderConfig) => {
      openEditPanel(header);
      onEdit?.(header);
    },
    [openEditPanel, onEdit]
  );

  const handleView = useCallback(
    (header: HeaderConfig) => {
      onView?.(header);
    },
    [onView]
  );

  const handlePreview = useCallback(
    (header: HeaderConfig) => {
      onPreview?.(header);
    },
    [onPreview]
  );

  const handleDelete = useCallback(
    (header: HeaderConfig) => {
      setHeaderToDelete(header);
      setDeleteModalOpen(true);
    },
    []
  );

  const handlePublish = useCallback(
    async (header: HeaderConfig) => {
      try {
        await publishHeaderMutation.mutateAsync(header.id);
      } catch (error) {
        // console.error("Publish failed:", error);
      }
    },
    [publishHeaderMutation]
  );

  const handleUnpublish = useCallback(
    async (header: HeaderConfig) => {
      try {
        await unpublishHeaderMutation.mutateAsync(header.id);
      } catch (error) {
        // console.error("Unpublish failed:", error);
      }
    },
    [unpublishHeaderMutation]
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <InlineLoading
          description={t("status.loading") || "Loading headers..."}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p style={{ color: "var(--cds-support-error)" }}>
          {t("errors.loadFailed") || "Failed to load headers"}
        </p>
      </div>
    );
  }

  if (!header) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <div className="empty-state-icon">
            <Image size={48} />
          </div>
          <h3 className="empty-state-title">
            {t("empty.title") || "No Header Configuration"}
          </h3>
          <p className="empty-state-description">
            {t("empty.message") ||
              "No header configuration has been set up yet. Create your first header to get started."}
          </p>
          <Button
            size="lg"
            onClick={handleCreateNew}
            kind="ghost"
            className="empty-state-button"
          >
            {t("actions.createNew")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`header-list ${className}`}>
      <Grid fullWidth>
        <HeaderCard
          header={header}
          onEdit={handleEdit}
          onView={handleView}
          onPreview={handlePreview}
          onDelete={handleDelete}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
        />
      </Grid>
      <ConfirmDeleteModal
        open={deleteModalOpen}
        title={"Confirm Deletion"}
        subtitle={headerToDelete ? `Are you sure you want to delete "${HeaderService.getDisplayName(headerToDelete)}"? This action cannot be undone.` : undefined}
        onConfirm={() => {
          if (headerToDelete) {
            deleteHeaderMutation.mutate(headerToDelete.id, {
              onSuccess: () => {
                HeaderNotificationService.showHeaderDeleted(HeaderService.getDisplayName(headerToDelete));
              },
              onError: (error: any) => {
                HeaderNotificationService.showHeaderDeletionError(error?.message || String(error));
              },
            });
          }
        }}
        onCancel={() => {
          setDeleteModalOpen(false);
          setHeaderToDelete(null);
        }}
      />
    </div>
  );
};
