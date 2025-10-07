# MSW (Mock Service Worker) Documentation

## Overview

MSW (Mock Service Worker) is used in this project to provide mock API responses when the real backend is unavailable or for offline development. This allows frontend development to continue independently of backend availability.

## When to Use MSW

### ✅ Use MSW When:

- **Local development** and backend is down/unavailable
- **Offline development** (e.g., on a plane, at a conference)
- **Frontend feature prototyping** before backend is ready
- **Testing** - for deterministic, isolated frontend tests
- **Demo purposes** - showing features without backend dependency

### ❌ Don't Use MSW When:

- **Production deployment** - always use real backend
- **Integration testing** with real backend
- **Performance testing** against real API

## Configuration

### Environment Variables

```env
# Enable MSW (for offline development)
NEXT_PUBLIC_API_MOCKING=enabled

# Disable MSW (for real backend)
NEXT_PUBLIC_API_MOCKING=disabled

# Real backend URL (when MSW is disabled)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005/api/v1
```

### Switching Between MSW and Real Backend

1. **To use MSW (offline mode):**

   ```env
   NEXT_PUBLIC_API_MOCKING=enabled
   ```

2. **To use real backend:**

   ```env
   NEXT_PUBLIC_API_MOCKING=disabled
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3005/api/v1
   ```

3. **Restart your development server** after changing these values.

## How MSW Works in This Project

### Architecture

```
src/lib/api/
├── http-client.ts          # Main HTTP client
├── mock-server.ts          # MSW server setup
└── mocks/
    ├── mock-database.ts    # In-memory mock data
    ├── auth-handlers.ts    # Auth API mocks
    └── office-settings-handlers.ts  # Office Settings API mocks
```

### Request Flow

1. **Frontend makes API call** → `httpClient.get('/api/v1/office-settings')`
2. **HTTP Client checks** → Is MSW enabled?
3. **If MSW enabled** → Request intercepted by MSW handlers
4. **If MSW disabled** → Request goes to real backend
5. **Response returned** → Same format regardless of source

## Available Mock Endpoints

### Authentication Endpoints

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

### Office Settings Endpoints

- `GET /api/v1/office-settings` - Get office settings (public)
- `GET /api/v1/office-settings/seo` - Get SEO settings (public)
- `GET /api/v1/office-settings/:id` - Get by ID (admin)
- `POST /api/v1/office-settings` - Create settings (admin)
- `PUT /api/v1/office-settings/:id` - Update settings (admin)
- `PUT /api/v1/office-settings/upsert` - Upsert settings (admin)
- `DELETE /api/v1/office-settings/:id` - Delete settings (admin)
- `POST /api/v1/office-settings/:id/background-photo` - Upload photo (admin)
- `DELETE /api/v1/office-settings/:id/background-photo` - Remove photo (admin)

## Mock Data Structure

### Office Settings Mock Data

```typescript
interface MockOfficeSettings {
  id: string;
  directorate: TranslatableEntity;
  officeName: TranslatableEntity;
  officeAddress: TranslatableEntity;
  backgroundPhoto?: string;
  email: string;
  phoneNumber: TranslatableEntity;
  xLink?: string;
  mapIframe?: string;
  website?: string;
  youtube?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Translatable Entity

```typescript
interface TranslatableEntity {
  en: string; // English text
  ne: string; // Nepali text
}
```

## How to Modify Mock Data

### 1. Update Seed Data

Edit `src/lib/api/mocks/mock-database.ts`:

```typescript
// Add new mock office settings
export const seedOfficeSettings: MockOfficeSettings[] = [
  {
    id: "office-settings-001",
    directorate: {
      en: "Ministry of Education",
      ne: "शिक्षा मन्त्रालय",
    },
    officeName: {
      en: "District Education Office",
      ne: "जिल्ला शिक्षा कार्यालय",
    },
    // ... other fields
  },
];
```

### 2. Update Mock Handlers

Edit `src/lib/api/mocks/office-settings-handlers.ts`:

```typescript
// Add new endpoint handler
http.get("/api/v1/office-settings/custom", ({ request }) => {
  return HttpResponse.json({
    success: true,
    data: { message: "Custom endpoint" },
    meta: { processingTime: 100 },
  });
});
```

### 3. Add New Mock Users

Edit `src/lib/api/mocks/mock-database.ts`:

```typescript
export const seedUsers: MockUser[] = [
  {
    id: "user-001",
    email: "admin@example.com",
    password: "hashed-password",
    role: "ADMIN",
    // ... other fields
  },
];
```

## Testing with MSW

### Jest Test Setup

MSW is automatically configured in `jest.setup.js`:

```javascript
// Global mocks for MSW
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.Response = class Response {
  /* ... */
};
global.BroadcastChannel = class BroadcastChannel {
  /* ... */
};
```

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { OfficeSettingsForm } from '@/domains/office-settings';

// MSW will automatically intercept API calls in tests
test('should load office settings', async () => {
  render(<OfficeSettingsForm />);

  // Wait for data to load
  await screen.findByText('Office Settings');

  // Assert mock data is displayed
  expect(screen.getByDisplayValue('Ministry of Education')).toBeInTheDocument();
});
```

### Service Testing

```typescript
import { OfficeSettingsService } from "@/domains/office-settings";

test("should create office settings", async () => {
  const data = {
    directorate: { en: "Test", ne: "परीक्षण" },
    // ... other fields
  };

  const result = await OfficeSettingsService.createSettings(data);
  expect(result.directorate.en).toBe("Test");
});
```

## Debugging MSW

### Enable Debug Logging

```env
NEXT_PUBLIC_DEBUG=true
```

### Check MSW Status

In browser console:

```javascript
// Check if MSW is active
window.__MSW_ENABLED__;

// Check intercepted requests
// (visible in Network tab when MSW is active)
```

### Common Issues

1. **MSW not starting:**
   - Check `NEXT_PUBLIC_API_MOCKING=enabled`
   - Restart development server
   - Check browser console for errors

2. **Requests not being intercepted:**
   - Verify URL matches handler patterns
   - Check if MSW is actually enabled
   - Ensure handler is properly exported

3. **Mock data not updating:**
   - Clear browser cache
   - Restart development server
   - Check if data is being seeded correctly

## Best Practices

### 1. Keep Mock Data Realistic

- Use realistic data that matches production
- Include edge cases and error scenarios
- Maintain data consistency across endpoints

### 2. Document Mock Behavior

- Update this documentation when adding new endpoints
- Include examples of request/response formats
- Document any special mock logic

### 3. Test Both Modes

- Test with MSW enabled (offline mode)
- Test with real backend when available
- Ensure both modes work identically

### 4. Version Control

- Commit mock data changes with feature code
- Keep mock data in sync with backend DTOs
- Document breaking changes to mock APIs

## Migration to Real Backend

When switching from MSW to real backend:

1. **Update environment variables:**

   ```env
   NEXT_PUBLIC_API_MOCKING=disabled
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3005/api/v1
   ```

2. **Test all features** with real backend
3. **Update any hardcoded URLs** or endpoints
4. **Verify authentication** works with real JWT tokens
5. **Test file uploads** with real backend storage

## Troubleshooting

### MSW Not Working

```bash
# Check if MSW is enabled
echo $NEXT_PUBLIC_API_MOCKING

# Restart development server
npm run dev

# Check browser console for MSW errors
```

### API Calls Failing

```bash
# Check network tab for failed requests
# Verify handler patterns match actual requests
# Check if MSW is intercepting requests
```

### Mock Data Issues

```bash
# Clear browser cache
# Restart development server
# Check mock database seeding
```

## Support

For issues with MSW setup or mock data:

1. Check this documentation
2. Review browser console errors
3. Verify environment configuration
4. Check if real backend is working
5. Create issue with detailed error information
