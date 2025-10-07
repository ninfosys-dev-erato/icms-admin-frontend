"use client";

import {
  Calendar,
  Favorite,
  OverflowMenuVertical,
  Share,
  StarFilled,
  User,
  View
} from "@carbon/icons-react";
import {
  OverflowMenu,
  OverflowMenuItem,
  Tag,
  Tile
} from "@carbon/react";
import { useTranslations } from "next-intl";
import React from "react";
import "../styles/content-management.css";
import { Content, ContentVisibility } from "../types/content";

interface ContentCardProps {
  content: Content;
  onEdit: (content: Content) => void;
  onDuplicate: (content: Content) => void;
  onArchive: (content: Content) => void;
  onDelete: (content: Content) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete
}) => {
  const t = useTranslations("content-management");

  // Get status color
  const getStatusColor = () => {
    switch (content.status) {
      case "PUBLISHED":
        return "green";
      case "DRAFT":
        return "blue";
      case "ARCHIVED":
        return "gray";
      default:
        return "gray";
    }
  };

  // Get visibility color
  const getVisibilityColor = (visibility: ContentVisibility): "blue" | "green" | "red" => {
    switch (visibility) {
      case 'public': return 'green';
      case 'private': return 'red';
      case 'role-based': return 'blue';
      default: return 'blue';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get display title (prefer English, fallback to Nepali)
  const getDisplayTitle = () => {
    if (content.title?.en) return content.title.en;
    if (content.title?.ne) return content.title.ne;
    return content.slug || 'Untitled';
  };

  // Get display excerpt (prefer English, fallback to Nepali)
  const getDisplayExcerpt = () => {
    if (content.excerpt?.en) return content.excerpt.en;
    if (content.excerpt?.ne) return content.excerpt.ne;
    return "";
  };

  // Get category display name
  const getCategoryDisplayName = () => {
    if (content.category?.name?.en) return content.category.name.en;
    if (content.category?.name?.ne) return content.category.name.ne;
    if (content.category?.slug) return content.category.slug;
    return 'Uncategorized';
  };

  // Get author display name
  const getAuthorDisplayName = () => {
    if (content.createdBy?.firstName && content.createdBy?.lastName) {
      return `${content.createdBy.firstName} ${content.createdBy.lastName}`;
    }
    if (content.createdBy?.firstName) return content.createdBy.firstName;
    if (content.createdBy?.lastName) return content.createdBy.lastName;
    if (content.createdBy?.email) return content.createdBy.email;
    return 'Unknown';
  };

  return (
    <Tile className="content-card">
      {/* Featured Image */}
      <div className="content-card-image">
        {content.featuredImageId ? (
          <div className="content-featured-image">
            <div className="image-placeholder">
              <span>Image</span>
            </div>
          </div>
        ) : (
          <div className="content-no-image">
            <div className="no-image-placeholder">
              <span>No Image</span>
            </div>
          </div>
        )}
        
        {/* Status and Visibility Badges */}
        <div className="content-badges">
          <Tag type={getStatusColor()} size="sm" className="status-badge">
            {t(`status.${content.status.toLowerCase()}`)}
          </Tag>
          <Tag type={getVisibilityColor('public')} size="sm" className="visibility-badge">
            {t('visibility.public')}
          </Tag>
        </div>

        {/* Featured Badge */}
        {content.featured && (
          <div className="featured-badge">
            <Tag type="purple" size="sm">
              <StarFilled size={12} />
              {t("card.featured", { default: "Featured" })}
            </Tag>
          </div>
        )}

        {/* Order Badge */}
        {content.order > 1 && (
          <div className="order-badge">
            <span className="order-number">{content.order}</span>
          </div>
        )}

        {/* Action Menu */}
        <div className="content-action-menu">
          <OverflowMenu
            flipped
            size="sm"
            aria-label={t('card.actions.menu')}
            renderIcon={OverflowMenuVertical}
          >
            <OverflowMenuItem
              itemText={t('card.actions.edit')}
              onClick={() => onEdit(content)}
            />
            <OverflowMenuItem
              itemText={t('card.actions.duplicate')}
              onClick={() => onDuplicate(content)}
            />
            <OverflowMenuItem
              itemText={t('card.actions.archive')}
              onClick={() => onArchive(content)}
            />
            <OverflowMenuItem
              hasDivider
              isDelete
              itemText={t('card.actions.delete')}
              onClick={() => onDelete(content)}
            />
          </OverflowMenu>
        </div>
      </div>

      {/* Content Information */}
      <div className="content-card-body">
        {/* Category */}
        {content.category && (
          <div className="content-category">
            <Tag type="blue" size="sm">
              {getCategoryDisplayName()}
            </Tag>
          </div>
        )}

        {/* Title */}
        <h3 className="content-title">
          {getDisplayTitle()}
        </h3>

        {/* Slug */}
        <div className="content-slug">
          <span className="slug-text">{content.slug}</span>
        </div>

        {/* Excerpt */}
        {getDisplayExcerpt() && (
          <p className="content-description">
            {truncateText(getDisplayExcerpt())}
          </p>
        )}

        {/* Tags - Not provided by backend yet */}
        {/* {content.tags && content.tags.length > 0 && (
          <div className="content-tags">
            {content.tags.slice(0, 3).map((tag, index) => (
              <Tag key={index} type="warm-gray" size="sm" className="content-tag">
                {tag}
              </Tag>
            ))}
            {content.tags.length > 3 && (
              <span className="more-tags">+{content.tags.length - 3}</span>
            )}
          </div>
        )} */}

        {/* Meta Information */}
        <div className="content-meta">
          {/* Author */}
          {content.createdBy && (
            <div className="content-author">
              <User size={16} />
              <span>{getAuthorDisplayName()}</span>
            </div>
          )}

          {/* Date */}
          <div className="content-date">
            <Calendar size={16} />
            <span>{formatDate(content.createdAt)}</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="content-stats">
          <div className="stat-item">
            <View size={16} />
            <span>{content.viewCount || 0}</span>
          </div>
          <div className="stat-item">
            <Favorite size={16} />
            <span>{content.likeCount || 0}</span>
          </div>
          <div className="stat-item">
            <Share size={16} />
            <span>{content.shareCount || 0}</span>
          </div>
        </div>
      </div>
    </Tile>
  );
};