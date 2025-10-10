"use client";

import React, { useMemo, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, Button, Dropdown, Layer, Search } from '@carbon/react';
import { Add, Reset, Close } from '@carbon/icons-react';
import { unstable_FeatureFlags as FeatureFlags } from '@carbon/ibm-products'; // Not available in latest package
import '@/lib/ibm-products/config';
import { useMediaStore } from '../stores/media-store';
import { useAlbumStore } from '../stores/album-store';
import { MediaList } from './media-list';
import { MediaPanelForms } from './media-panel-forms';
import { AlbumList } from './album-list';
import { AlbumPanelForms } from './album-panel-forms';
import '../styles/media.css';
import { useTranslations } from 'next-intl';
import SidePanelForm from '@/components/shared/side-panel-form';

export const MediaContainer: React.FC = () => {
  const mediaStore = useMediaStore();
  const albumStore = useAlbumStore();
  const { selectedTabIndex, setSelectedTabIndex } = mediaStore;
  const t = useTranslations('media');
  const tAlbums = useTranslations('media.albums');

  // Filters for media
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filters for albums
  const [albumStatusFilter, setAlbumStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [albumSearchTerm, setAlbumSearchTerm] = useState('');

  const isMediaTab = selectedTabIndex === 0;

  const panelTitle = useMemo(() => {
    if (isMediaTab) return mediaStore.panelMode === 'edit' ? t('form.editTitle') : t('form.uploadTitle');
    return albumStore.panelMode === 'edit' ? tAlbums('form.editTitle') : tAlbums('form.createTitle');
  }, [isMediaTab, mediaStore.panelMode, albumStore.panelMode, t, tAlbums]);

  const handleResetFilters = () => {
    if (isMediaTab) {
      setStatusFilter('all');
      setVisibilityFilter('all');
      setSearchTerm('');
    } else {
      setAlbumStatusFilter('all');
      setAlbumSearchTerm('');
    }
  };

  const handleCreate = () => {
    if (isMediaTab) mediaStore.openCreatePanel();
    else albumStore.openCreatePanel();
  };

  const panelOpen = isMediaTab ? mediaStore.panelOpen : albumStore.panelOpen;
  const isSubmitting = isMediaTab ? mediaStore.isSubmitting : albumStore.isSubmitting;
  const setSubmitting = isMediaTab ? mediaStore.setSubmitting : albumStore.setSubmitting;
  const closePanel = isMediaTab ? mediaStore.closePanel : albumStore.closePanel;

  const primaryBtnText = isSubmitting
    ? (isMediaTab ? t('form.saving') : tAlbums('form.saving'))
    : (isMediaTab
        ? mediaStore.panelMode === 'edit' ? t('actions.update') : t('actions.create')
        : albumStore.panelMode === 'edit' ? tAlbums('actions.update') : tAlbums('create'));

  const secondaryBtnText = isMediaTab ? t('actions.cancel') : tAlbums('actions.cancel');

  return (
    <Layer className="media-container">
      <div className="p--card-padding">
        <Breadcrumb noTrailingSlash className="breadcrumb--spacing">
          <BreadcrumbItem href="#">{t('breadcrumbs.home', { default: 'Home' })}</BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{isMediaTab ? t('title') : tAlbums('title')}</BreadcrumbItem>
        </Breadcrumb>

        <div className="flex--row-space">
          <div className="flex--1">
            <h1 className="media-title">{isMediaTab ? t('title') : tAlbums('title')}</h1>
            <p className="media-subtitle">{isMediaTab ? t('subtitle') : tAlbums('subtitle')}</p>
          </div>

          <Button size="lg" renderIcon={Add} onClick={handleCreate} kind="primary">
            {isMediaTab ? t('form.uploadTitle') : tAlbums('create')}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
  <div className="p--card-padding-sm">
        <div className="media-main-tabs">
          <button type="button" className={`media-tab-button ${isMediaTab ? 'active' : ''}`} onClick={() => setSelectedTabIndex(0)}>
            {t('list.title')}
          </button>
          <button type="button" className={`media-tab-button ${!isMediaTab ? 'active' : ''}`} onClick={() => setSelectedTabIndex(1)}>
            {tAlbums('title')}
          </button>
        </div>
      </div>

      {/* Filters */}
  <div className="p--card-padding-sm filters-row">
        {isMediaTab ? (
          <>
            <Search size="lg" labelText={t('filters.search')} placeholder={t('filters.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Button kind="ghost" size="md" renderIcon={Reset} onClick={handleResetFilters} disabled={isMediaTab ? (statusFilter === 'all' && visibilityFilter === 'all' && !searchTerm) : (albumStatusFilter === 'all' && !albumSearchTerm)}>
          {t('filters.reset')}
        </Button>
  <div className="flex--row-gap">
            <Dropdown className='media-status-dropdown' id="media-status-dropdown" 
            size="md" label={t('filters.status')} titleText={t('filters.status')} 
            items={[{ id: 'all', label: t('filters.all') }, { id: 'active', label: t('filters.active') }, { id: 'inactive', label: t('filters.inactive') }]} 
            selectedItem={{ id: statusFilter, label: statusFilter === 'all' ? t('filters.all') : statusFilter === 'active' ? t('filters.active') : t('filters.inactive') }} 
            itemToString={(item) => (item ? item.label : '')} 
            onChange={({ selectedItem }) => setStatusFilter((selectedItem?.id || 'all') as any)} />

            
            <Dropdown className='media-status-dropdown' id="media-visibility-dropdown" size="md" label={t('filters.visibility')} titleText={t('filters.visibility')} items={[{ id: 'all', label: t('filters.all') }, { id: 'public', label: t('filters.public') }, { id: 'private', label: t('filters.private') }]} selectedItem={{ id: visibilityFilter, label: visibilityFilter === 'all' ? t('filters.all') : visibilityFilter === 'public' ? t('filters.public') : t('filters.private') }} itemToString={(item) => (item ? item.label : '')} onChange={({ selectedItem }) => setVisibilityFilter((selectedItem?.id || 'all') as any)} />
        </div>
          </>
        ) : (
          <>
            <Search size="lg" labelText={t('filters.search', { default: 'Search' } as any)} placeholder={tAlbums('filters.searchPlaceholder')} value={albumSearchTerm} onChange={(e) => setAlbumSearchTerm(e.target.value)} />
            <Dropdown className='media-status-dropdown' id="album-status-dropdown" size="md" label={tAlbums('filters.status')} titleText={tAlbums('filters.status')} items={[{ id: 'all', label: tAlbums('filters.all') }, { id: 'active', label: tAlbums('filters.active') }, { id: 'inactive', label: tAlbums('filters.inactive') }]} selectedItem={{ id: albumStatusFilter, label: albumStatusFilter === 'all' ? tAlbums('filters.all') : albumStatusFilter === 'active' ? tAlbums('filters.active') : tAlbums('filters.inactive') }} itemToString={(item) => (item ? item.label : '')} onChange={({ selectedItem }) => setAlbumStatusFilter((selectedItem?.id || 'all') as any)} />
          </>
        )}

     
      </div>

      {/* Main Content */}
      <div className="p--card-padding-sm text--left">
        {isMediaTab ? (
          <MediaList search={searchTerm} statusFilter={statusFilter} visibilityFilter={visibilityFilter} />
        ) : (
          <AlbumList search={albumSearchTerm} statusFilter={albumStatusFilter} />
        )}
      </div>

      {/* Right side panel - depends on active tab */}
        <SidePanelForm
          // Use existing keys; media has list.title, albums has formTitle
          formTitle={isMediaTab ? (t('list.title', { default: 'Media' } as any)) : (tAlbums('formTitle', { default: 'Album' } as any))}
          title={panelTitle}
          open={!!panelOpen}
          onRequestClose={() => {
            if (!isSubmitting) closePanel();
          }}
          primaryButtonText={primaryBtnText}
          secondaryButtonText={secondaryBtnText}
          onRequestSubmit={() => {
            if (isSubmitting) return;
            setSubmitting(true);
            const containerId = isMediaTab ? 'media-form' : 'album-form';
            const evtName = isMediaTab ? 'media:submit' : 'album:submit';
            const formContainer = document.getElementById(containerId);
            if (formContainer) {
              formContainer.dispatchEvent(new Event(evtName, { cancelable: true, bubbles: true }));
              // Let the form handle resetting submitting state
            } else if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
              console.warn('Submit skipped, form container not found:', containerId);
            }
          }}
          selectorPageContent="#main-content"
          selectorPrimaryFocus="input, textarea, [tabindex]:not([tabindex='-1'])"
          className="media-sidepanel-form"
        >
          <div className="panel-close-btn">
            <Button
              kind="ghost"
              hasIconOnly
              size="sm"
              iconDescription={t('actions.cancel')}
              onClick={closePanel}
              renderIcon={Close}
            />
          </div>
          {isMediaTab ? (
            <div id="media-form">
              <MediaPanelForms onSuccess={closePanel} />
            </div>
          ) : (
            <div id="album-form">
              <AlbumPanelForms onSuccess={closePanel} />
            </div>
          )}
        </SidePanelForm>
    </Layer>
  );
};


