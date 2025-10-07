"use client";

import React, { useEffect, useState } from 'react';
import { Button, Column, FormGroup, Grid, InlineLoading, Toggle } from '@carbon/react';
import { Reset } from '@carbon/icons-react';
import { useAlbumStore } from '../stores/album-store';
import { useCreateAlbum } from '../hooks/use-album-queries';
import { useTranslations } from 'next-intl';
import { TranslatableField } from '@/components/shared/translatable-field';

export const AlbumCreateForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { isSubmitting, setSubmitting, createFormState, updateFormField, resetFormState } = useAlbumStore();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const createMutation = useCreateAlbum();
  const t = useTranslations('media.albums');

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!createFormState.name.en.trim() || !createFormState.name.ne.trim()) errors.name = t('form.validation.nameRequiredBoth');
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); e.stopPropagation(); submit(); };
    const custom = (e: Event) => { e.preventDefault(); e.stopPropagation(); submit(); };
    const container = document.getElementById('album-form');
    const form = container?.closest('form');
    if (form) {
      form.addEventListener('submit', handler);
    }
    container?.addEventListener('album:submit', custom as any);
    return () => {
      if (form) form.removeEventListener('submit', handler);
      container?.removeEventListener('album:submit', custom as any);
    };
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createFormState]);

  const submit = async () => {
    setSubmitting(true);
    if (!validate()) { setSubmitting(false); return; }
    try {
      await createMutation.mutateAsync({
        name: createFormState.name,
        description: createFormState.description,
        isActive: createFormState.isActive,
      } as any);
      resetFormState('create');
      setValidationErrors({});
      onSuccess?.();
    } catch (err) {
      // handled upstream
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="flex--row-end m--mb-05">
        <Button kind="ghost" size="sm" renderIcon={Reset} onClick={() => { resetFormState('create'); setValidationErrors({}); }} disabled={isSubmitting}>{t('actions.reset')}</Button>
      </div>
      {isSubmitting && (
        <div className="m--mb-1">
          <InlineLoading description={t('form.saving')} />
        </div>
      )}

      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          <FormGroup legendText={t('form.basicInfo')}>
            <TranslatableField label={t('form.nameEn') as any} value={createFormState.name} onChange={(val) => updateFormField('create', 'name', val)} />
            <div className="m--mt-1">
              <TranslatableField type="textarea" label={t('form.descriptionEn') as any} value={createFormState.description} onChange={(val) => updateFormField('create', 'description', val)} />
            </div>
            <div className="m--mt-1">
              <Toggle id="album-isActive" labelText={t('form.isActive')} toggled={createFormState.isActive} onToggle={(checked) => updateFormField('create', 'isActive', checked)} />
            </div>
          </FormGroup>
        </Column>
      </Grid>
    </div>
  );
};


