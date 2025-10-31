"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { InlineLoading, Pagination, OverflowMenu, OverflowMenuItem, Tag, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer } from '@carbon/react';
import { DataBase } from '@carbon/icons-react';
import { useAlbums, useDeleteAlbum } from '../hooks/use-album-queries';
import ConfirmDeleteModal from '@/components/shared/confirm-delete-modal';
import type { Album, AlbumQuery } from '../types/album';
import { useAlbumStore } from '../stores/album-store';
import { useTranslations } from 'next-intl';

interface AlbumListProps {
  search?: string;
  statusFilter?: 'all' | 'active' | 'inactive';
}

export const AlbumList: React.FC<AlbumListProps> = ({ search = '', statusFilter = 'all' }) => {
  const [query, setQuery] = useState<Partial<AlbumQuery>>({ page: 1, limit: 12 });
  const { openEditPanel } = useAlbumStore();
  const queryResult = useAlbums(query);
  const t = useTranslations('media.albums');
  const tMedia = useTranslations('media');
  const deleteMutation = useDeleteAlbum();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  useEffect(() => {
    setQuery((prev) => ({ ...prev, page: 1, search: search || undefined, isActive: statusFilter === 'all' ? undefined : statusFilter === 'active' }));
  }, [search, statusFilter]);

  const data = queryResult.data;
  const items = (data?.data ?? []) as Album[];
  const pagination = data?.pagination;

  // Client-side fallback filtering if backend doesn't handle it
  const filteredItems = useMemo(() => {
    let next = items;
    const term = (search || '').trim().toLowerCase();
    if (term) {
      next = next.filter((a) => {
        const fields = [
          a.name?.en,
          a.name?.ne,
          a.description?.en,
          a.description?.ne,
        ].filter(Boolean) as string[];
        return fields.some((f) => f.toLowerCase().includes(term));
      });
    }
    if (statusFilter !== 'all') {
      const wantActive = statusFilter === 'active';
      next = next.filter((a) => a.isActive === wantActive);
    }
    return next;
  }, [items, search, statusFilter]);

  if (queryResult.isLoading && items.length === 0) {
    return (
      <div className="loading-container">
        <InlineLoading description={t('list.loading')} />
      </div>
    );
  }

  return (
    <div>
      {filteredItems.length > 0 ? (
        <TableContainer title={""} description="">
          <Table size="md" useZebraStyles>
            <TableHead>
              <TableRow>
                <TableHeader>{t('form.nameEn')}</TableHeader>
                <TableHeader>{t('form.descriptionEn')}</TableHeader>
                <TableHeader>{t('list.items', { default: 'Items' } as any)}</TableHeader>
                <TableHeader>{t('filters.status')}</TableHeader>
                <TableHeader>{tMedia('card.actions')}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-en" title={a.name.en}>{a.name.en || a.name.ne}</TableCell>
                  <TableCell className="font-en" title={a.description?.en || a.description?.ne || ''}>
                    {(a.description?.en || a.description?.ne || '').slice(0, 80)}
                  </TableCell>
                  <TableCell>{a.mediaCount}</TableCell>
                  <TableCell>
                    <Tag size="sm" type={a.isActive ? 'green' : 'gray'}>{a.isActive ? 'Active' : 'Inactive'}</Tag>
                  </TableCell>
                  <TableCell className="text--right">
                    <OverflowMenu flipped size="sm" aria-label={tMedia('card.actions')}>
                      <OverflowMenuItem itemText={tMedia('card.edit')} onClick={() => openEditPanel(a)} />
                      <OverflowMenuItem
                        hasDivider
                        isDelete
                        itemText={tMedia('card.delete')}
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          setSelectedAlbum(a);
                          setIsConfirmOpen(true);
                        }}
                      />
                    </OverflowMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
              {selectedAlbum && (
                <ConfirmDeleteModal
                  open={isConfirmOpen}
                  title={tMedia('card.confirmDeleteTitle', { default: 'Confirm deletion' } as any)}
                  subtitle={tMedia('card.confirmDeleteSubtitle', {
                    name: selectedAlbum?.name?.en || selectedAlbum?.name?.ne,
                    default: `Are you sure you want to delete "${selectedAlbum?.name?.en || selectedAlbum?.name?.ne}"? This action cannot be undone.`,
                  } as any)}
                  onConfirm={() => {
                    if (selectedAlbum) deleteMutation.mutate(selectedAlbum.id);
                    setIsConfirmOpen(false);
                    setSelectedAlbum(null);
                  }}
                  onCancel={() => {
                    setIsConfirmOpen(false);
                    setSelectedAlbum(null);
                  }}
                />
              )}
        </TableContainer>
      ) : (
        <div className="empty-state">
          <div className="empty-state-content">
            <div className="empty-state-icon">
              <DataBase size={48} />
            </div>
            <h3 className="empty-state-title">{t('list.emptyTitle')}</h3>
            <p className="empty-state-description">{t('list.emptyDescription')}</p>
          </div>
        </div>
      )}

      {!!pagination && filteredItems.length > 0 && (
        <div className="pagination-container">
          <Pagination
            page={pagination.page}
            pageSize={pagination.limit}
            pageSizes={[12, 24, 48, 96]}
            totalItems={pagination.total}
            onChange={({ page, pageSize }) => {
              if (page !== undefined) setQuery((prev) => ({ ...prev, page }));
              if (pageSize !== undefined) setQuery((prev) => ({ ...prev, limit: pageSize, page: 1 }));
            }}
            size="md"
          />
        </div>
      )}
    </div>
  );
};


