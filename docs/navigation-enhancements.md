# Navigation System Enhancements

## Overview

This document describes the enhancements made to the navigation system to support dynamic linking between menus, categories, and content through the new `categorySlug` and `contentSlug` fields.

## New Fields Added

### Menu Table
- **`categorySlug`** (optional): Links a menu to a specific category for dynamic content generation

### Menu Item Table  
- **`categorySlug`** (optional): Links a menu item to a specific category
- **`contentSlug`** (optional): Links a menu item to specific content within a category

## Implementation Details

### 1. Type Definitions Updated

The navigation types have been enhanced to include the new fields:

```typescript
// In src/domains/navigation/types/navigation.ts

export interface Menu {
  // ... existing fields
  categorySlug?: string; // New field for linking menu to category
}

export interface MenuItem {
  // ... existing fields
  categorySlug?: string; // New field for linking menu item to category
  contentSlug?: string; // New field for linking menu item to content
}

export interface MenuFormData {
  // ... existing fields
  categorySlug?: string; // New field for linking menu to category
}

export interface MenuItemFormData {
  // ... existing fields
  categorySlug?: string; // New field for linking menu item to category
  contentSlug?: string; // New field for linking menu item to content
}
```

### 2. Store Management Updated

The navigation store has been updated to handle the new fields in form state management:

```typescript
// In src/domains/navigation/stores/navigation-store.ts

// Form state now includes the new fields
createFormState: {
  // ... existing fields
  categorySlug: '', // New field for linking menu to category
}

createMenuItemFormState: {
  // ... existing fields
  categorySlug: '', // New field for linking menu item to category
  contentSlug: '', // New field for linking menu item to content
}
```

### 3. New API Hooks Added

Three new hooks have been added for autocomplete functionality:

```typescript
// In src/domains/navigation/hooks/use-navigation-queries.ts

// Hook for fetching categories for autocomplete
export const useCategoriesForNavigation = () => {
  return useQuery({
    queryKey: ['categories-for-navigation'],
    queryFn: async (): Promise<{ data: any[] }> => {
      const response = await httpClient.get('/categories', { 
        params: { page: 1, limit: 100, isActive: true } 
      });
      const responseData = response.data as any;
      const data = responseData?.data || responseData || [];
      return { data: Array.isArray(data) ? data : [] };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for fetching content by category for autocomplete
export const useContentByCategoryForNavigation = (categorySlug?: string) => {
  return useQuery({
    queryKey: ['content-by-category-for-navigation', categorySlug],
    queryFn: async (): Promise<{ data: any[] }> => {
      if (!categorySlug) return { data: [] };
      const response = await httpClient.get(`/content/category/${categorySlug}`, { 
        params: { page: 1, limit: 100, status: 'PUBLISHED' } 
      });
      const responseData = response.data as any;
      const data = responseData?.data || responseData || [];
      return { data: Array.isArray(data) ? data : [] };
    },
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for searching content for autocomplete
export const useSearchContentForNavigation = (searchTerm: string) => {
  return useQuery({
    queryKey: ['search-content-for-navigation', searchTerm],
    queryFn: async (): Promise<{ data: any[] }> => {
      if (!searchTerm.trim()) return { data: [] };
      const response = await httpClient.get('/content/search', { 
        params: { q: searchTerm, limit: 20, status: 'PUBLISHED' } 
      });
      const responseData = response.data as any;
      const data = responseData?.data || responseData || [];
      return { data: Array.isArray(data) ? data : [] };
    },
    enabled: !!searchTerm.trim(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
```

### 4. Form Components Enhanced

#### Menu Create/Edit Forms

Both menu creation and editing forms now include a `categorySlug` field with autocomplete:

```typescript
// In src/domains/navigation/components/menu-create-form.tsx
// and src/domains/navigation/components/menu-edit-form.tsx

// Category Slug with Autocomplete
<ComboBox
  id="categorySlug"
  titleText={t("form.categorySlug.label", { default: "Category (Optional)" })}
  placeholder={t("form.categorySlug.placeholder", { default: "Type to search categories..." })}
  items={categoryOptions}
  itemToString={(item) => item?.text || ''}
  selectedItem={categoryOptions.find(cat => cat.id === formData.categorySlug) || null}
  onChange={({ selectedItem }) => handleInputChange("categorySlug", selectedItem?.id || '')}
  onInputChange={(inputValue) => {
    if (!inputValue) {
      handleInputChange("categorySlug", '');
    }
  }}
  helperText={t("form.categorySlug.helper", { 
    default: "Link this menu to a specific category for dynamic content" 
  })}
/>
```

#### Menu Item Forms

Menu item forms now include both `categorySlug` and `contentSlug` fields with intelligent autocomplete:

```typescript
// In src/domains/navigation/components/menu-item-form.tsx

// Category Slug with Autocomplete
<ComboBox
  id="categorySlug"
  titleText={t("menuItems.form.categorySlug.label", { default: "Category (Optional)" })}
  placeholder={t("menuItems.form.categorySlug.placeholder", { default: "Type to search categories..." })}
  items={categoryOptions}
  itemToString={(item) => item?.text || ''}
  selectedItem={categoryOptions.find(cat => cat.id === formData.categorySlug) || null}
  onChange={({ selectedItem }) => {
    handleInputChange("categorySlug", selectedItem?.id || '');
    // Clear contentSlug when category changes
    if (formData.contentSlug) {
      handleInputChange("contentSlug", '');
    }
  }}
  onInputChange={(inputValue) => {
    if (!inputValue) {
      handleInputChange("categorySlug", '');
      // Clear contentSlug when category is cleared
      if (formData.contentSlug) {
        handleInputChange("contentSlug", '');
      }
    }
  }}
  helperText={t("menuItems.form.categorySlug.helper", { 
    default: "Link this menu item to a specific category" 
  })}
/>

// Content Slug with Autocomplete (only show for CONTENT type or when category is selected)
{(formData.itemType === 'CONTENT' || formData.categorySlug) && (
  <ComboBox
    id="contentSlug"
    titleText={t("menuItems.form.contentSlug.label", { default: "Content (Optional)" })}
    placeholder={t("menuItems.form.contentSlug.placeholder", { default: "Type to search content..." })}
    items={contentOptions}
    itemToString={(item) => item?.text || ''}
    selectedItem={contentOptions.find(content => content.id === formData.contentSlug) || null}
    onChange={({ selectedItem }) => handleInputChange("contentSlug", selectedItem?.id || '')}
    onInputChange={(inputValue) => {
      if (!inputValue) {
        handleInputChange("contentSlug", '');
      }
    }}
    helperText={t("menuItems.form.contentSlug.helper", { 
      default: formData.itemType === 'CONTENT' 
        ? "Link this menu item to specific content" 
        : "Optional content to link to this category"
    })}
  />
)}
```

### 5. Internationalization Support

New translation keys have been added for both English and Nepali:

#### English (locales/en/domains/navigation.json)
```json
{
  "form": {
    "categorySlug": {
      "label": "Category (Optional)",
      "placeholder": "Type to search categories...",
      "helper": "Link this menu to a specific category for dynamic content"
    }
  },
  "menuItems": {
    "form": {
      "categorySlug": {
        "label": "Category (Optional)",
        "placeholder": "Type to search categories...",
        "helper": "Link this menu item to a specific category"
      },
      "contentSlug": {
        "label": "Content (Optional)",
        "placeholder": "Type to search content...",
        "helper": "Link this menu item to specific content"
      }
    }
  }
}
```

#### Nepali (locales/ne/domains/navigation.json)
```json
{
  "form": {
    "categorySlug": {
      "label": "श्रेणी (वैकल्पिक)",
      "placeholder": "श्रेणीहरू खोज्न टाइप गर्नुहोस्...",
      "helper": "यो मेनुलाई गतिशील सामग्रीको लागि विशिष्ट श्रेणीमा जडान गर्नुहोस्"
    }
  },
  "menuItems": {
    "form": {
      "categorySlug": {
        "label": "श्रेणी (वैकल्पिक)",
        "placeholder": "श्रेणीहरू खोज्न टाइप गर्नुहोस्...",
        "helper": "यस मेनु वस्तुलाई विशिष्ट श्रेणीमा जडान गर्नुहोस्"
      },
      "contentSlug": {
        "label": "सामग्री (वैकल्पिक)",
        "placeholder": "सामग्री खोज्न टाइप गर्नुहोस्...",
        "helper": "यस मेनु वस्तुलाई विशिष्ट सामग्रीमा जडान गर्नुहोस्"
      }
    }
  }
}
```

## Usage Examples

### 1. Creating a Menu Linked to a Category

```typescript
// When creating a menu, you can now specify a categorySlug
const menuData = {
  name: { en: "News Menu", ne: "समाचार मेनु" },
  description: { en: "News and updates", ne: "समाचार र अपडेटहरू" },
  location: "HEADER",
  isActive: true,
  isPublished: true,
  categorySlug: "news" // Link to the "news" category
};
```

### 2. Creating a Menu Item Linked to Content

```typescript
// When creating a menu item, you can link it to specific content
const menuItemData = {
  title: { en: "Latest News", ne: "नवीनतम समाचार" },
  itemType: "CONTENT",
  categorySlug: "news", // Link to the "news" category
  contentSlug: "latest-news-article" // Link to specific content
};
```

### 3. Creating a Category-Based Menu Item

```typescript
// Create a menu item that links to a category
const categoryMenuItemData = {
  title: { en: "All News", ne: "सबै समाचार" },
  itemType: "CATEGORY",
  categorySlug: "news" // Link to the "news" category
};
```

## Benefits

1. **Dynamic Navigation**: Menus can now automatically adapt to category content
2. **Content Linking**: Menu items can be directly linked to specific content
3. **Flexible Structure**: Support for both category-based and content-based navigation
4. **Autocomplete**: Elegant search and selection interface for categories and content
5. **No Dependencies**: Menus can be created before or after content/categories exist
6. **Internationalization**: Full support for English and Nepali languages

## Backend Integration

The backend already supports these fields through the existing API endpoints:

- **Menu endpoints**: Support `categorySlug` field
- **Menu item endpoints**: Support both `categorySlug` and `contentSlug` fields
- **Validation**: Backend validates that referenced categories and content exist
- **URL Resolution**: Backend automatically resolves URLs based on the slug fields

## Future Enhancements

1. **Content Preview**: Show content preview when selecting contentSlug
2. **Category Tree**: Hierarchical category selection for nested structures
3. **Bulk Operations**: Support for bulk linking multiple menu items
4. **Analytics**: Track usage of linked categories and content
5. **Caching**: Implement caching for frequently accessed categories and content

## Testing

To test the new functionality:

1. Create a new menu with a categorySlug
2. Create menu items with various combinations of categorySlug and contentSlug
3. Verify that the autocomplete works correctly
4. Test the form validation and submission
5. Verify that the backend correctly processes the new fields

## Conclusion

These enhancements provide a powerful and flexible navigation system that can dynamically link to categories and content while maintaining backward compatibility. The autocomplete functionality ensures a smooth user experience, and the optional nature of the fields means existing functionality continues to work unchanged.
