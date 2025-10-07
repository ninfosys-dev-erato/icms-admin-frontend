"use client";

import React, { useState, useCallback } from "react";
import {
  Button,
  Tag,
  InlineLoading,
  Tile,
  OverflowMenu,
  OverflowMenuItem,
} from "@carbon/react";
import {
  Add,
  Edit,
  TrashCan,
  ChevronRight,
  ChevronDown,
  Link,
  Document,
  Category,
} from "@carbon/icons-react";
import { useTranslations } from "next-intl";
import { MenuItem, MenuItemType, Menu } from "../types/navigation";
import {
  useMenuItems,
  useDeleteMenuItem,
} from "../hooks/use-navigation-queries";

interface MenuItemTreeProps {
  menu: Menu;
  onAddItem?: (parentId?: string) => void;
  onEditItem?: (item: MenuItem) => void;
  onDeleteItem?: (item: MenuItem) => void;
  onReorder?: (orders: { id: string; order: number }[]) => void;
}

interface TreeItem extends Omit<MenuItem, "children"> {
  children?: TreeItem[];
  isExpanded?: boolean;
  level: number;
}

export const MenuItemTree: React.FC<MenuItemTreeProps> = ({
  menu,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onReorder,
}) => {
  const t = useTranslations("navigation");

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Fetch menu items for this menu
  const {
    data: menuItemsData,
    isLoading,
    error,
  } = useMenuItems({ menuId: menu.id });
  const deleteMutation = useDeleteMenuItem();

  const menuItems: MenuItem[] = menuItemsData?.data || [];

  // Convert flat list to tree structure
  const buildTree = useCallback(
    (items: MenuItem[], parentId?: string, level = 0): TreeItem[] => {
      return items
        .filter((item) => item.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          ...item,
          level,
          children: buildTree(items, item.id, level + 1),
          isExpanded: expandedItems.has(item.id),
        }));
    },
    [expandedItems]
  );

  const treeItems = buildTree(menuItems);

  // Handle expand/collapse
  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Get icon for menu item type
  const getTypeIcon = (itemType: MenuItemType) => {
    switch (itemType) {
      case "LINK":
        return <Link size={16} />;
      case "CONTENT":
        return <Document size={16} />;
      case "CATEGORY":
        return <Category size={16} />;
      default:
        return <Document size={16} />;
    }
  };

  // Get color for menu item type
  const getTypeColor = (itemType: MenuItemType) => {
    switch (itemType) {
      case "LINK":
        return "blue";
      case "CONTENT":
        return "green";
      case "CATEGORY":
        return "purple";
      default:
        return "gray";
    }
  };


  // Render menu items as cards with unique order numbers and three-dot menu
  const renderMenuItemCards = (items: MenuItem[]) => {
    // Sort by order
    const sorted = [...items].sort((a, b) => a.order - b.order);
    return (
      <div className="menu-cards-grid">
        {sorted.map((item, idx) => (
          <div className="menu-card-wrapper" key={item.id}>
            <div className="menu-card-premium">
              <div className="menu-card-premium__header" style={{ position: 'relative' }}>
                <div className="menu-card-premium__number">#{idx + 1}</div>
                <div style={{ position: 'absolute', top: 0, right: 0 }}>
                  <OverflowMenu flipped size="sm" aria-label={t("table.actions.menu", { default: "Menu item actions" })}>
                    <OverflowMenuItem
                      itemText={t("actions.edit", { default: "Edit" })}
                      onClick={() => onEditItem?.(item)}
                    >
                      <Edit size={16} />
                    </OverflowMenuItem>
                    <OverflowMenuItem
                      hasDivider
                      isDelete
                      itemText={t("actions.delete", { default: "Delete" })}
                      onClick={() => onDeleteItem?.(item)}
                    >
                      <TrashCan size={16} />
                    </OverflowMenuItem>
                  </OverflowMenu>
                </div>
              </div>
              <div className="menu-card-premium__content">
                <div className="menu-card-premium__title-section">
                  <div className="item-icon" style={{ display: 'inline-flex', marginRight: 8 }}>
                    {getTypeIcon(item.itemType)}
                  </div>
                  <span className="menu-card-premium__title">
                    {item.title?.en || item.title?.ne || t("table.noName", { default: "Untitled" })}
                  </span>
                </div>
                <div className="menu-card-premium__meta-row">
                  <div className="menu-card-premium__status-tags">
                    <Tag type={getTypeColor(item.itemType)} size="sm">
                      {t(`menuItems.types.${item.itemType}`, { default: item.itemType })}
                    </Tag>
                    <Tag type={item.isActive ? "green" : "gray"} size="sm">
                      {item.isActive
                        ? t("status.active", { default: "Active" })
                        : t("status.inactive", { default: "Inactive" })}
                    </Tag>
                    <Tag type={item.isVisible ? "teal" : "gray"} size="sm">
                      {item.isVisible
                        ? t("status.visible", { default: "Visible" })
                        : t("status.hidden", { default: "Hidden" })}
                    </Tag>
                    <Tag type={item.isPublished ? "blue" : "gray"} size="sm">
                      {item.isPublished
                        ? t("status.published", { default: "Published" })
                        : t("status.draft", { default: "Draft" })}
                    </Tag>
                  </div>
                  {item.url && (
                    <span className="item-url" style={{ marginLeft: 8 }}>{item.url}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <InlineLoading
          description={t("status.loading", {
            default: "Loading menu items...",
          })}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error loading menu items: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="menu-item-tree">
      {/* Tree Header */}
      <div className="tree-header">
        <div className="tree-title">
          <h3>{t("menuItems.title", { default: "Menu Items" })}</h3>
          <p>
            {t("menuItems.subtitle", {
              default: "Manage the structure and hierarchy of menu items",
            })}
          </p>
        </div>
        <div className="tree-actions">
          <Button kind="primary" onClick={() => onAddItem?.()}>
            <Add size={16} style={{ marginRight: "0.5rem" }} />
            {t("menuItems.create.title", { default: "Create Menu Item" })}
          </Button>
        </div>
      </div>

      {/* Card Grid Content */}
      <div className="tree-content">
        {menuItems.length > 0 ? (
          renderMenuItemCards(menuItems)
        ) : (
          <div className="empty-tree">
            <div className="empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">
                  <Category size={48} />
                </div>
                <h3 className="empty-state-title">
                  {t("menuItems.empty.title", { default: "No Menu Items" })}
                </h3>
                <p className="empty-state-description">
                  {t("menuItems.empty.message", {
                    default:
                      "This menu has no items yet. Create your first menu item to get started.",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
