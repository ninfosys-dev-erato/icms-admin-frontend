"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Column, Dropdown, FormGroup, FormLabel, Grid, InlineLoading, Search, Tile, Toggle } from '@carbon/react';
import { Filter, Reset, CheckmarkFilled, Image } from '@carbon/icons-react';
import { useAlbumStore } from '../stores/album-store';
import { useUpdateAlbum, useBulkAddMediaToAlbum, useBulkRemoveMediaFromAlbum, useAlbumMedia } from '../hooks/use-album-queries';
import type { Album } from '../types/album';
import { usePublicGalleryMedia } from '../hooks/use-media-queries';
import MediaUrlService from '@/services/media-url-service';
import type { Media as MediaType } from '../types/media';
import { useTranslations } from 'next-intl';
import { TranslatableField } from '@/components/shared/translatable-field';

export const AlbumEditForm: React.FC<{ album: Album; onSuccess?: () => void }> = ({ album, onSuccess }) => {
  const { isSubmitting, setSubmitting, formStateById, updateFormField, resetFormState } = useAlbumStore();
  const formData = formStateById[album.id] ?? { name: album.name, description: album.description ?? { en: '', ne: '' }, isActive: album.isActive };
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const updateMutation = useUpdateAlbum();
  const bulkAdd = useBulkAddMediaToAlbum();
  const bulkRemove = useBulkRemoveMediaFromAlbum();
  const albumMediaQuery = useAlbumMedia(album.id, true);
  const t = useTranslations('media.albums');
  const tMedia = useTranslations('media');

  // Safe translation helper to avoid throwing IntlError when keys are missing
  const safeT = (fn: () => string, fallback: string) => {
    try { return fn(); } catch { return fallback; }
  };

  // Local UI-only state for media layout (presentation only; no logic yet)
  const [mediaSearch, setMediaSearch] = useState('');
  const sortOptions = useMemo(
    () => [
      { id: 'recent', label: t('form.sort.recent', { default: 'Recently added' } as any) },
      { id: 'name-asc', label: t('form.sort.alphabet', { default: 'Name (A–Z)' } as any) },
      { id: 'name-desc', label: t('form.sort.date', { default: 'Date (Z–A)' } as any) },
    ],
    [t]
  );
  const [sortBy, setSortBy] = useState<{ id: string; label: string } | null>(null);
  useEffect(() => { setSortBy(sortOptions[0] ?? null); }, [sortOptions]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = React.useRef<HTMLDivElement | null>(null);
  // local debounced search to avoid firing queries on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(mediaSearch);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(mediaSearch), 250);
    return () => clearTimeout(id);
  }, [mediaSearch]);

  // map dropdown selection into actual API sort field & direction
  const handleSortChange = (selected: { id: string; label: string } | null) => {
    setSortBy(selected);
    if (!selected) return;
    if (selected.id === 'recent') {
      // recent -> newest first by createdAt
      setSortDirection('desc');
    } else if (selected.id === 'name-asc') {
      setSortDirection('asc');
    } else if (selected.id === 'name-desc') {
      setSortDirection('desc');
    }
  };

  // fetch images to preview in the album media section
  const mapSortField = (id?: string | null) => {
    if (!id) return undefined;
    switch (id) {
      case 'recent':
        return 'createdAt';
      case 'name-asc':
      case 'name-desc':
        return 'originalName';
      default:
        return id;
    }
  };

  const mediaQuery = {
    page: 1,
    limit: 12,
    search: debouncedSearch || undefined,
    category: 'image',
    sortBy: mapSortField(sortBy?.id ?? undefined),
    sortOrder: sortDirection,
  } as any;
  const mediaQueryResult = usePublicGalleryMedia(mediaQuery);
  const mediaItems = (mediaQueryResult.data?.data ?? []) as MediaType[];
  const existingAlbumMediaIds = useMemo(() => {
    const items = (albumMediaQuery.data ?? []) as any[];
    return items
      .map((am: any) => am?.mediaId ?? am?.media?.id ?? am?.id)
      .filter(Boolean) as string[];
  }, [albumMediaQuery.data]);
  // local selection state: set of selected media ids
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const seededRef = React.useRef(false);
  // Reset seeding flag when album changes
  useEffect(() => { seededRef.current = false; }, [album.id]);
  // Seed selected state from existing album media when first loaded (once)
  useEffect(() => {
    if (seededRef.current) return;
    if (!albumMediaQuery.isLoading && albumMediaQuery.data) {
      const map: Record<string, boolean> = {};
      for (const mid of existingAlbumMediaIds) map[mid] = true;
      setSelectedIds((prev) => ({ ...map, ...prev }));
      seededRef.current = true;
    }
  }, [albumMediaQuery.isLoading, albumMediaQuery.data, existingAlbumMediaIds.join('|')]);
  const selectedList = useMemo(() => Object.keys(selectedIds).filter((k) => selectedIds[k]), [selectedIds]);
  const anySelected = selectedList.length > 0;

  const isSelected = (id: string) => !!selectedIds[id];
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // No extra action buttons; selection will be applied on submit

  React.useEffect(() => {
    if (!filtersOpen) return undefined;
    const onDocClick = (e: MouseEvent) => {
      if (!filtersRef.current) return;
      if (!filtersRef.current.contains(e.target as Node)) setFiltersOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFiltersOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [filtersOpen]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.en.trim() || !formData.name.ne.trim()) errors.name = t('form.validation.nameRequiredBoth');
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); e.stopPropagation(); submit(); };
    const container = document.getElementById('album-form');
    const form = container?.closest('form') as HTMLFormElement | null;

    // Listen to a custom event so side panels can trigger submit reliably
    if (container) {
      container.addEventListener('album:submit', handler as EventListener);
    }
    // Also listen at the document level as a robust fallback
    if (typeof document !== 'undefined') {
      document.addEventListener('album:submit', handler as EventListener);
    }
    // Also listen to native form submit (e.g., pressing Enter inside inputs)
    if (form) {
      form.addEventListener('submit', handler);
    }
    return () => {
      if (container) container.removeEventListener('album:submit', handler as EventListener);
      if (typeof document !== 'undefined') document.removeEventListener('album:submit', handler as EventListener);
      if (form) form.removeEventListener('submit', handler);
    };
  }, [album.id, formData, selectedList.join('|')]);

  const submit = async () => {
    console.log('Submitting album edit form for album ID:', album.id, 'with data:', formData, 'and selected media IDs:', selectedList);
    setSubmitting(true);
    if (!validate()) { setSubmitting(false); return; }
    try {
      // First update the album's basic info
      await updateMutation.mutateAsync({ id: album.id, data: formData as any });
      // Compute diffs relative to existing album media
      const currentSet = new Set(existingAlbumMediaIds);
      const newSet = new Set(selectedList);
      const toAdd: string[] = [];
      const toRemove: string[] = [];
      for (const id of newSet) if (!currentSet.has(id)) toAdd.push(id);
      for (const id of currentSet) if (!newSet.has(id)) toRemove.push(id);

      if (toAdd.length > 0) {
        console.log('Adding media IDs to album:', album.id, toAdd);
        await bulkAdd.mutateAsync({ albumId: album.id, mediaIds: toAdd });
      }
      if (toRemove.length > 0) {
        console.log('Removing media IDs from album:', album.id, toRemove);
        await bulkRemove.mutateAsync({ albumId: album.id, mediaIds: toRemove });
      }
      setValidationErrors({});
      onSuccess?.();
    } catch (err) {
      // handled upstream
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="flex--row-end m--mb-05">
        <Button kind="ghost" size="sm" renderIcon={Reset} onClick={() => { resetFormState(album.id); setValidationErrors({}); }} disabled={isSubmitting}>{t('actions.reset')}</Button>
      </div>
      {isSubmitting && (
        <div className="m--mb-1">
          <InlineLoading description={t('form.saving')} />
        </div>
      )}

      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          <FormGroup legendText={t('form.basicInfo')}>
            <TranslatableField label={t('form.nameEn') as any} value={formData.name} onChange={(val) => updateFormField(album.id, 'name', val)} />
            <div className="m--mt-1">
              <TranslatableField type="textarea" label={t('form.descriptionEn') as any} value={formData.description} onChange={(val) => updateFormField(album.id, 'description', val)} />
            </div>
            {/* Media section layout (Carbon-compliant; UI only) */}
            <div className="m--mt-1">
              <FormLabel>{t('form.media', { default: 'Media' } as any)}</FormLabel>

              {/* Search: full width, top margin */}
              <div className="m--mt-1" style={{ width: '100%' }}>
                <Search
                  size="lg"
                  labelText={t('filters.search', { default: 'Search' } as any)}
                  placeholder={t('filters.searchAlbumsPlaceholder', { default: 'Search albums...' } as any)}
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                />
              </div>

              {/* Controls row: right aligned (bulk actions + Sort By + Filter icon) */}
              {/* Controls row: right aligned (Sort By + Filter icon) */}
              <div className="flex--row-end m--mt-1" style={{ alignItems: 'center' }}>
                <Dropdown
                  id="album-media-sortby"
                  size="sm"
                  label={t('form.sortBy', { default: 'Sort by' } as any)}
                  titleText={t('form.sortBy', { default: 'Sort by' } as any)}
                  hideLabel
                  items={sortOptions}
                  selectedItem={sortBy as any}
                  itemToString={(item) => (item ? item.label : '')}
                  onChange={({ selectedItem }) => handleSortChange(selectedItem as any)}
                />
                <div style={{ position: 'relative' }} ref={filtersRef}>
                  <Button
                    hasIconOnly
                    kind="ghost"
                    size="md"
                    renderIcon={Filter}
                    iconDescription={t('filters.open', { default: 'Open filters' } as any)}
                    tooltipPosition="left"
                    onClick={() => setFiltersOpen((s) => !s)}
                    aria-expanded={filtersOpen}
                    aria-haspopup="menu"
                  />

                  {filtersOpen && (
                    <div
                      role="menu"
                      aria-label={t('filters.open', { default: 'Open filters' } as any)}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 6px)',
                        background: 'var(--cds-layer, #fff)',
                        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                        borderRadius: 4,
                        padding: '6px 4px',
                        zIndex: 40,
                        minWidth: 160,
                        border: '1px solid var(--cds-border-subtle, rgba(0,0,0,0.12))',
                      }}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setSortDirection('asc'); setFiltersOpen(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: 'var(--cds-text-01, #161616)',
                        }}
                      >
                        <span>ASC</span>
                        {sortDirection === 'asc' && <CheckmarkFilled size={16} />}
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setSortDirection('desc'); setFiltersOpen(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: 'var(--cds-text-01, #161616)',
                        }}
                      >
                        <span>DSC</span>
                        {sortDirection === 'desc' && <CheckmarkFilled size={16} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Media tiles grid - show real uploaded images (preserve aspect ratio) */}
              {debouncedSearch && mediaQueryResult.isLoading ? (
                // skeleton grid while searching
                <div
                  className="m--mt-1"
                  style={{
                    display: 'grid',
                    // force 3 tiles per row (min 160px each, will stretch evenly)
                    gridTemplateColumns: 'repeat(3, minmax(160px, 1fr))',
                    gap: 'var(--cds-spacing-03)',
                  }}
                >
                  <style>{`
                    .media-tile { position: relative; background: var(--cds-layer, #fff); }
                    .media-tile:hover { box-shadow: 0 6px 18px rgba(16,24,40,0.08); transform: translateY(-2px); }
                    .media-tile--selected::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(15,98,254,0.06), rgba(15,98,254,0.04)); pointer-events: none; }
                    /* Checkbox small adjustment to match tile */
                    .cds--checkbox { --checkbox-size: 18px; }
                  `}</style>
                  {Array.from({ length: 8 }).map((_, idx) => (
                    // wrapper ensures a square grid cell; Tile fills it
                    <div key={idx} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
                      <Tile
                        className="media-tile"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0',
                          boxSizing: 'border-box',
                          border: '1px solid var(--cds-border-subtle, rgba(0,0,0,0.12))',
                          background: 'linear-gradient(90deg, rgba(230,230,230,1) 25%, rgba(245,245,245,1) 37%, rgba(230,230,230,1) 63%)',
                          backgroundSize: '400% 100%',
                          animation: 'shimmer 1.2s linear infinite',
                        }}
                      />
                    </div>
                  ))}
                  <style>{`@keyframes shimmer { 0%{background-position:100% 0}100%{background-position:0 0}}`}</style>
                </div>
              ) : debouncedSearch && !mediaQueryResult.isLoading && mediaItems.length === 0 ? (
                // no results for search - Carbon-compliant empty state with adjustable size
                (() => {
                  const maxWidth = 520; // adjust this number to change empty state width
                  const iconSize = 48; // icon size (48 is typical)
                  return (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                      <div style={{ textAlign: 'center', maxWidth: `${maxWidth}px`, width: '100%', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: iconSize + 12, height: iconSize + 12, borderRadius: (iconSize + 12) / 2, background: 'var(--cds-layer, #fff)' }}>
                            <Image size={iconSize} />
                          </div>
                        </div>
                        <h3 style={{ margin: 0, marginBottom: 8, fontSize: '1.125rem', lineHeight: '1.33' }}>{tMedia('list.emptyTitle', { default: 'No media found' } as any)}</h3>
                        <p style={{ margin: 0, marginTop: 0, color: 'var(--cds-text-02, #6f6f6f)' }}>{tMedia('list.emptyDescription', { default: 'No media matched your search' } as any)}</p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div
                  className="m--mt-1"
                  style={{
                    display: 'grid',
                    // force 4 tiles per row (min 100px each, will stretch evenly)
                    gridTemplateColumns: 'repeat(3, minmax(140px, 1fr))',
                    gap: 'var(--cds-spacing-03)',
                  }}
                >
                    {mediaItems.length > 0 ? (
                    mediaItems.map((m) => {
                      const src = m.presignedUrl || m.url ? MediaUrlService.toProxyUrl(m.presignedUrl ?? m.url ?? '') : null;
                      const selected = isSelected(m.id);
                      return (
                        // wrapper ensures square cell; Tile fills it
                        <div key={m.id} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
                          <Tile
                            className={`media-tile ${selected ? 'media-tile--selected' : ''}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleSelect(m.id)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSelect(m.id); } }}
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0',
                              boxSizing: 'border-box',
                              border: selected ? '2px solid var(--cds-focus, #0f62fe)' : '1px solid var(--cds-border-subtle, rgba(0,0,0,0.12))',
                              overflow: 'hidden',
                              transition: 'box-shadow 160ms ease, transform 120ms ease',
                              cursor: 'pointer',
                            }}
                          >
                            {/* top-right checkbox overlay */}
                            <div
                              aria-hidden
                              role="button"
                              tabIndex={-1}
                              title={selected
                                ? safeT(() => t('form.selected' as any), 'Selected')
                                : safeT(() => t('form.select' as any), 'Select')}
                              style={{ position: 'absolute', top: 2, right: 2, zIndex: 6, padding: 4, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={(e) => { e.stopPropagation(); toggleSelect(m.id); }}
                            >
                              {/* Use CheckmarkFilled icon from @carbon/icons-react instead of Checkbox */} 
                              {selected ? <CheckmarkFilled size={25} color='blue'/> : <div style={{ width: 20, height: 20 }} />}
                              {/* {selected ? (
                                <div style={{ width: 20, height: 20, borderRadius: 9999, backgroundColor: 'var(--cds-success, #24a148)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <CheckmarkFilled size={12} style={{ color: '#ffffff' }} />
                                </div>
                              ) : (
                                <div style={{ width: 20, height: 20, borderRadius: 4 }} />
                              )} */}
                            </div>

                              {src ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={src}
                                alt={m.altText || m.title || m.originalName}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                                <span className="cds--label">{t('form.preview', { default: 'Preview' } as any)}</span>
                              </div>
                            )}
                          </Tile>
                          {/* bottom overlay actions for single add/remove */}
                          {/* No per-tile single action buttons to preserve current design */}
                        </div>
                      );
                    })
                  ) : (
                    // keep placeholder tiles if there are no media items
                    Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
                        <Tile
                          className="media-tile"
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0',
                            boxSizing: 'border-box',
                            border: idx === 0 ? '2px solid var(--cds-focus, #0f62fe)' : '1px solid var(--cds-border-subtle, rgba(0,0,0,0.12))',
                          }}
                        >
                          <span className="cds--label">{t('form.preview', { default: 'Preview' } as any)}</span>
                        </Tile>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="m--mt-1">
              <Toggle id="album-isActive" labelText={t('form.isActive')} toggled={formData.isActive} onToggle={(checked) => updateFormField(album.id, 'isActive', checked)} />
            </div>
          </FormGroup>
        </Column>
      </Grid>
    </div>
  );
};


