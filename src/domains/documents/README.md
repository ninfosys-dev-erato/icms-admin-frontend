# Document Management Module

A comprehensive document management system built with React, TypeScript, and Carbon UI design principles. This module provides full CRUD operations for documents with support for file uploads, versioning, and analytics.

## Features

### Core Functionality
- **Document CRUD Operations**: Create, read, update, and delete documents
- **File Upload & Management**: Support for multiple document formats (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, CSV, ZIP, RAR)
- **Version Control**: Create and manage document versions with change logs
- **Bilingual Support**: Full English and Nepali language support with translatable fields
- **Document Categories**: Predefined categories (Official, Report, Form, Policy, Procedure, Guideline, Notice, Circular, Other)
- **Status Management**: Document lifecycle management (Draft, Published, Archived, Expired)

### Advanced Features
- **Bulk Operations**: Bulk update, delete, publish, and archive documents
- **Search & Filtering**: Advanced filtering by status, category, type, and custom tags
- **Analytics Dashboard**: Comprehensive statistics and download analytics
- **Import/Export**: Support for bulk document import and export operations
- **Access Control**: Public/private document settings with authentication requirements

### UI/UX Features
- **Carbon UI Compliance**: Strict adherence to IBM Carbon Design System
- **Responsive Design**: Mobile-first responsive layout with adaptive grids
- **Side Panel Forms**: IBM Products side panel for create/edit operations
- **Drag & Drop**: Intuitive file upload with drag and drop support
- **Real-time Validation**: Client-side form validation with error handling

## Architecture

### Component Structure
```
src/domains/documents/
├── components/
│   ├── document-container.tsx          # Main container with side panel
│   ├── document-form.tsx               # Form wrapper component
│   ├── document-create-form.tsx        # Create form with file upload
│   ├── document-edit-form.tsx          # Edit form with versioning
│   ├── document-list.tsx               # Grid/list view with filters
│   ├── document-upload.tsx             # File upload component
│   ├── document-statistics.tsx         # Statistics dashboard
│   └── translatable-field.tsx          # Bilingual input component
├── hooks/
│   └── use-document-queries.ts         # React Query hooks
├── services/
│   ├── document-service.ts              # Business logic
│   └── document-notification-service.ts # Notifications
├── stores/
│   └── document-store.ts                # Zustand store for UI state
├── repositories/
│   └── document-repository.ts           # API layer
├── types/
│   └── document.ts                      # TypeScript interfaces
├── styles/
│   └── documents.css                    # Carbon-compliant styles
└── index.ts                             # Public exports
```

### Data Flow
1. **UI Components** → **Zustand Store** → **React Query Hooks**
2. **React Query Hooks** → **Document Service** → **Repository**
3. **Repository** → **HTTP Client** → **Backend API**

### State Management
- **Zustand Store**: Manages UI state, form data, and panel state
- **React Query**: Handles server state, caching, and synchronization
- **Local State**: Component-specific state for validation and UI interactions

## Usage

### Basic Implementation
```tsx
import { DocumentContainer } from '@/domains/documents';

export default function DocumentsPage() {
  return <DocumentContainer />;
}
```

### Custom Document List
```tsx
import { DocumentList, useDocuments } from '@/domains/documents';

function CustomDocumentList() {
  const { data, isLoading } = useDocuments({ limit: 20 });
  
  return (
    <DocumentList 
      documents={data?.data}
      onEdit={handleEdit}
      onView={handleView}
    />
  );
}
```

### Form Integration
```tsx
import { DocumentCreateForm, useCreateDocument } from '@/domains/documents';

function CustomForm() {
  const createMutation = useCreateDocument();
  
  const handleSubmit = (data) => {
    createMutation.mutate(data);
  };
  
  return <DocumentCreateForm onSuccess={handleSubmit} />;
}
```

## API Integration

### Backend Requirements
The module expects a RESTful API with the following endpoints:

- `GET /admin/documents` - List documents with pagination and filtering
- `POST /admin/documents` - Create new document
- `PUT /admin/documents/:id` - Update document
- `DELETE /admin/documents/:id` - Delete document
- `POST /admin/documents/upload` - Upload document with metadata
- `GET /admin/documents/statistics` - Get document statistics
- `POST /admin/documents/:id/versions` - Create document version

### Data Models
```typescript
interface Document {
  id: string;
  title: TranslatableEntity;        // { en: string, ne: string }
  description?: TranslatableEntity;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  category: DocumentCategory;
  status: DocumentStatus;
  documentNumber?: string;
  version?: string;
  publishDate?: Date;
  expiryDate?: Date;
  tags?: string[];
  isPublic: boolean;
  requiresAuth: boolean;
  order: number;
  isActive: boolean;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}
```

## Configuration

### Environment Variables
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_FILE_UPLOAD_URL=http://localhost:3001/api/admin/documents/upload

# File Upload Limits
NEXT_PUBLIC_MAX_FILE_SIZE=104857600  # 100MB in bytes
NEXT_PUBLIC_ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx,txt,rtf,csv,zip,rar
```

### Carbon UI Configuration
The module automatically imports and configures IBM Products components:
```typescript
import "@/lib/ibm-products/config";
```

## Styling

### CSS Architecture
- **Carbon Variables**: Uses Carbon Design System CSS custom properties
- **Scoped Styles**: Component-specific styles to prevent conflicts
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Accessibility**: High contrast ratios and keyboard navigation support

### Customization
```css
/* Override Carbon variables for custom theming */
:root {
  --cds-ui-01: #f4f4f4;
  --cds-ui-02: #ffffff;
  --cds-interactive-01: #0f62fe;
}

/* Custom component styles */
.document-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## Internationalization

### Translation Keys
The module supports both English and Nepali languages through the `next-intl` library:

```json
{
  "title": "Documents",
  "subtitle": "Manage official documents, reports, forms and policies.",
  "actions": {
    "createNew": "Create New",
    "update": "Update"
  }
}
```

### Language Switching
```typescript
import { useRouter } from 'next/router';

const router = useRouter();
const { locale } = router;

// Switch to Nepali
router.push(router.pathname, router.asPath, { locale: 'ne' });
```

## Testing

### Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import { DocumentContainer } from '@/domains/documents';

test('renders document container', () => {
  render(<DocumentContainer />);
  expect(screen.getByText('Documents')).toBeInTheDocument();
});
```

### Hook Testing
```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useDocuments } from '@/domains/documents';

test('fetches documents', async () => {
  const { result } = renderHook(() => useDocuments());
  expect(result.current.isLoading).toBe(true);
});
```

## Performance

### Optimization Strategies
- **React Query Caching**: Intelligent caching and background updates
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: Efficient rendering of large document lists

### Bundle Size
- **Tree Shaking**: Only imported components are included
- **Code Splitting**: Dynamic imports for heavy components
- **Bundle Analysis**: Webpack bundle analyzer integration

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Core functionality works without JavaScript

## Contributing

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency rules
- **Prettier**: Code formatting automation
- **Husky**: Pre-commit hooks for quality checks

## License

This module is part of the CSIO Dadeldhura Admin Frontend project and follows the same licensing terms.

## Support

For technical support or feature requests, please refer to the project documentation or create an issue in the project repository.
