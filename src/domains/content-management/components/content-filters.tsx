"use client";

import { Filter, Reset } from "@carbon/icons-react";
import {
  Button,
  Column,
  DatePicker,
  DatePickerInput,
  DismissibleTag,
  Dropdown,
  Grid,
  NumberInput,
  Search,
  Stack,
  TextInput,
  Toggle
} from "@carbon/react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import {
  Category,
  ContentFilters as ContentFiltersType,
  ContentStatus,
  ContentVisibility
} from "../types/content";

interface ContentFiltersProps {
  filters: ContentFiltersType;
  categories: Category[];
  onSearch: (search: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onStatusChange: (status: ContentStatus | 'all') => void;
  onVisibilityChange: (visibility: ContentVisibility | 'all') => void;
  onLanguageChange: (language: 'en' | 'ne' | 'all') => void;
  onDateRangeChange: (dateFrom?: string, dateTo?: string) => void;
  onTagFilter: (tags: string[]) => void;
  onFeaturedImageFilter: (hasFeaturedImage?: boolean) => void;
  onPublishedFilter: (isPublished?: boolean) => void;
  onFeaturedFilter: (isFeatured?: boolean) => void;
  onOrderRangeChange: (orderMin?: number, orderMax?: number) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const ContentFilters: React.FC<ContentFiltersProps> = ({
  filters,
  categories,
  onSearch,
  onCategoryChange,
  onStatusChange,
  onVisibilityChange,
  onLanguageChange,
  onDateRangeChange,
  onTagFilter,
  onFeaturedImageFilter,
  onPublishedFilter,
  onFeaturedFilter,
  onOrderRangeChange,
  onReset,
  hasActiveFilters
}) => {
  const t = useTranslations("content-management");
  const [isExpanded, setIsExpanded] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Handle tag input
  const handleTagInputChange = (value: string) => {
    setTagInput(value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...(filters.tags || []), tagInput.trim()];
      onTagFilter(newTags);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = (filters.tags || []).filter(tag => tag !== tagToRemove);
    onTagFilter(newTags);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return undefined;
    return new Date(dateString).toISOString().split('T')[0];
  };

  // Handle date changes
  const handleDateFromChange = (date: Date | undefined) => {
    const dateString = date ? date.toISOString() : undefined;
    onDateRangeChange(dateString, filters.dateTo);
  };

  const handleDateToChange = (date: Date | undefined) => {
    const dateString = date ? date.toISOString() : undefined;
    onDateRangeChange(filters.dateFrom, dateString);
  };

  // Handle order range changes
  const handleOrderMinChange = (e: any, { value }: any) => {
    const orderMin = value !== undefined ? Number(value) : undefined;
    onOrderRangeChange(orderMin, filters.orderMax);
  };

  const handleOrderMaxChange = (e: any, { value }: any) => {
    const orderMax = value !== undefined ? Number(value) : undefined;
    onOrderRangeChange(filters.orderMin, orderMax);
  };

  return (
    <div className="content-filters">
      {/* Basic Filters Row */}
      <div className="filters-basic-row">
        <Grid fullWidth>
          <Column lg={6} md={4} sm={4}>
            <Search
              id="content-search"
              size="lg"
              labelText={t("filters.search")}
              placeholder={t("filters.searchPlaceholder")}
              closeButtonLabelText={t("filters.clearSearch")}
              value={filters.search || ""}
              onChange={(e) => onSearch(e.target.value)}
            />
          </Column>
          
          <Column lg={3} md={4} sm={4}>
            <Dropdown
              id="content-category-filter"
              size="md"
              label={t("filters.category")}
              titleText={t("filters.category")}
              items={[
                { id: "all", label: t("filters.allCategories") },
                ...categories.map(cat => ({
                  id: cat.id,
                  label: cat.name.en || cat.name.ne || cat.slug
                }))
              ]}
              selectedItem={{ 
                id: filters.categoryId || "all", 
                label: filters.categoryId 
                  ? categories.find(c => c.id === filters.categoryId)?.name.en || 
                    categories.find(c => c.id === filters.categoryId)?.name.ne || 
                    categories.find(c => c.id === filters.categoryId)?.slug || 
                    "Unknown"
                  : t("filters.allCategories")
              }}
              itemToString={(item) => (item ? item.label : "")}
              onChange={({ selectedItem }) => onCategoryChange(selectedItem?.id || "all")}
            />
          </Column>
          
          <Column lg={3} md={4} sm={4}>
            <Dropdown
              id="content-status-filter"
              size="md"
              label={t("filters.status")}
              titleText={t("filters.status")}
              items={[
                { id: "all", label: t("filters.allStatuses") },
                { id: "draft", label: t("status.draft") },
                { id: "published", label: t("status.published") },
                { id: "archived", label: t("status.archived") },
                { id: "scheduled", label: t("status.scheduled") }
              ]}
              selectedItem={{ 
                id: filters.status || "all", 
                label: filters.status ? t(`status.${filters.status}`) : t("filters.allStatuses")
              }}
              itemToString={(item) => (item ? item.label : "")}
              onChange={({ selectedItem }) => onStatusChange((selectedItem?.id || "all") as ContentStatus | 'all')}
            />
          </Column>
        </Grid>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="filters-toggle-row">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Filter}
          onClick={() => setIsExpanded(!isExpanded)}
          iconDescription={isExpanded ? t("filters.hideAdvanced") : t("filters.showAdvanced")}
        >
          {isExpanded ? t("filters.hideAdvanced") : t("filters.showAdvanced")}
        </Button>
        
        {hasActiveFilters && (
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Reset}
            onClick={onReset}
            iconDescription={t("filters.reset")}
          >
            {t("filters.reset")}
          </Button>
        )}
      </div>

      {/* Advanced Filters (Collapsible) */}
      {isExpanded && (
        <div className="filters-advanced-section">
          <Grid fullWidth>
            {/* Visibility and Language */}
            <Column lg={4} md={4} sm={4}>
              <Stack gap={4}>
                <Dropdown
                  id="content-visibility-filter"
                  size="md"
                  label={t("filters.visibility")}
                  titleText={t("filters.visibility")}
                  items={[
                    { id: "all", label: t("filters.allVisibilities") },
                    { id: "public", label: t("visibility.public") },
                    { id: "private", label: t("visibility.private") },
                    { id: "role-based", label: t("visibility.roleBased") }
                  ]}
                  selectedItem={{ 
                    id: filters.visibility || "all", 
                    label: filters.visibility ? t(`visibility.${filters.visibility}`) : t("filters.allVisibilities")
                  }}
                  itemToString={(item) => (item ? item.label : "")}
                  onChange={({ selectedItem }) => onVisibilityChange((selectedItem?.id || "all") as ContentVisibility | 'all')}
                />
                
                <Dropdown
                  id="content-language-filter"
                  size="md"
                  label={t("filters.language")}
                  titleText={t("filters.language")}
                  items={[
                    { id: "all", label: t("filters.allLanguages") },
                    { id: "en", label: t("languages.english") },
                    { id: "ne", label: t("languages.nepali") }
                  ]}
                  selectedItem={{ 
                    id: filters.language || "all", 
                    label: filters.language === "en" ? t("languages.english") : 
                           filters.language === "ne" ? t("languages.nepali") : 
                           t("filters.allLanguages")
                  }}
                  itemToString={(item) => (item ? item.label : "")}
                  onChange={({ selectedItem }) => onLanguageChange((selectedItem?.id || "all") as 'en' | 'ne' | 'all')}
                />
              </Stack>
            </Column>

            {/* Date Range */}
            <Column lg={4} md={4} sm={4}>
              <Stack gap={4}>
                <DatePicker
                  dateFormat="Y-m-d"
                  datePickerType="single"
                  value={formatDate(filters.dateFrom)}
                  onChange={(dates) => handleDateFromChange(dates?.[0])}
                >
                  <DatePickerInput
                    id="date-from"
                    labelText={t("filters.dateFrom")}
                    placeholder="YYYY-MM-DD"
                    size="md"
                  />
                </DatePicker>
                
                <DatePicker
                  dateFormat="Y-m-d"
                  datePickerType="single"
                  value={formatDate(filters.dateTo)}
                  onChange={(dates) => handleDateToChange(dates?.[0])}
                >
                  <DatePickerInput
                    id="date-to"
                    labelText={t("filters.dateTo")}
                    placeholder="YYYY-MM-DD"
                    size="md"
                  />
                </DatePicker>
              </Stack>
            </Column>

            {/* Boolean Filters */}
            <Column lg={4} md={4} sm={4}>
              <Stack gap={4}>
                <Toggle
                  id="featured-image-filter"
                  labelText={t("filters.hasFeaturedImage")}
                  toggled={filters.hasFeaturedImage === true}
                  onChange={(checked) => onFeaturedImageFilter(checked ? true : undefined)}
                />
                
                <Toggle
                  id="published-filter"
                  labelText={t("filters.isPublished")}
                  toggled={filters.isPublished === true}
                  onChange={(checked) => onPublishedFilter(checked ? true : undefined)}
                />

                <Toggle
                  id="featured-filter"
                  labelText={t("filters.isFeatured")}
                  toggled={filters.isFeatured === true}
                  onChange={(checked) => onFeaturedFilter(checked ? true : undefined)}
                />
              </Stack>
            </Column>

            {/* Order Range */}
            <Column lg={4} md={4} sm={4}>
              <Stack gap={4}>
                <NumberInput
                  id="order-min"
                  label={t("filters.orderMin")}
                  placeholder="0"
                  min={0}
                  value={filters.orderMin}
                  onChange={handleOrderMinChange}
                  size="md"
                />
                
                <NumberInput
                  id="order-max"
                  label={t("filters.orderMax")}
                  placeholder="100"
                  min={0}
                  value={filters.orderMax}
                  onChange={handleOrderMaxChange}
                  size="md"
                />
              </Stack>
            </Column>

            {/* Tags Input */}
            <Column lg={8} md={4} sm={4}>
              <div className="tags-filter-section">
                <TextInput
                  id="tags-input"
                  labelText={t("filters.tags")}
                  placeholder={t("filters.tagsPlaceholder")}
                  value={tagInput}
                  onChange={(e) => handleTagInputChange(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  size="md"
                />
                
                {filters.tags && filters.tags.length > 0 && (
                  <div className="tags-display">
                    {filters.tags.map((tag, index) => (
                      <DismissibleTag
                        key={index}
                        type="blue"
                        size="sm"
                        onClose={() => removeTag(tag)}
                        className="filter-tag"
                      >
                        {tag}
                      </DismissibleTag>
                    ))}
                  </div>
                )}
              </div>
            </Column>
          </Grid>
        </div>
      )}
    </div>
  );
}; 