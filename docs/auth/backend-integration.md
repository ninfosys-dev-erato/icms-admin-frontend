# Authentication Backend Integration

## Overview

The frontend authentication system has been successfully integrated with the real backend running on `http://localhost:3005`. This integration provides secure JWT-based authentication with automatic token refresh and proper error handling.

## Backend Endpoints

### Authentication Endpoints

| Method | Endpoint                | Description          | Access        |
| ------ | ----------------------- | -------------------- | ------------- |
| `POST` | `/api/v1/auth/register` | Register new user    | Public        |
| `POST` | `/api/v1/auth/login`    | User login           | Public        |
| `GET`  | `/api/v1/auth/me`       | Get current user     | Authenticated |
| `POST` | `/api/v1/auth/refresh`  | Refresh access token | Public        |
| `POST` | `/api/v1/auth/logout`   | User logout          | Authenticated |

### Request/Response Format

#### Login Request

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Login Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN",
      "isActive": true,
      "isEmailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh-token-string",
    "expiresIn": "1h",
    "tokenType": "Bearer"
  }
}
```

## Frontend Integration

### Environment Configuration

```env
# Real backend configuration
NEXT_PUBLIC_API_MOCKING=disabled
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005/api/v1
NEXT_PUBLIC_DEBUG=true
```

### Authentication Flow

1. **Login Process**:
   - User enters credentials in login form
   - Frontend calls `/api/v1/auth/login` endpoint
   - Backend validates credentials and returns JWT tokens
   - Frontend stores tokens in localStorage and cookies
   - User is redirected to dashboard

2. **Token Management**:
   - Access tokens are automatically included in API requests
   - Refresh tokens are used to get new access tokens when expired
   - Tokens are cleared on logout or authentication failure

3. **Session Persistence**:
   - Tokens are stored in localStorage for persistence
   - Cookies are set for middleware authentication
   - Auth state is managed by Zustand store

### Components

#### Auth Store (`src/stores/auth-store.ts`)

- Manages authentication state
- Handles login/logout operations
- Persists user data in localStorage

#### Auth Repository (`src/repositories/auth-repository.ts`)

- Handles API calls to backend
- Manages token refresh logic
- Provides clean interface for auth operations

#### Auth Initializer (`src/components/auth/auth-initializer.tsx`)

- Initializes authentication on app load
- Checks for existing tokens
- Fetches current user if authenticated

#### Login Form (`src/domains/auth/components/login-form.tsx`)

- Handles user login UI
- Validates form inputs
- Manages login state and errors

## Testing

### Backend Connection Test

```bash
# Test authentication endpoints
node test-auth-integration.js
```

### Manual Testing

1. Visit `http://localhost:3000/en/login`
2. Use test credentials:
   - Email: `admin@test.com`
   - Password: `AdminPass123!`
3. Verify successful login and redirect to dashboard

### Test Users

The following test users are available in the backend:

| Email                  | Password        | Role  | Status |
| ---------------------- | --------------- | ----- | ------ |
| `admin@test.com`       | `AdminPass123!` | ADMIN | Active |
| `testuser@example.com` | `TestPass123!`  | ADMIN | Active |

## Error Handling

### Common Error Scenarios

1. **Invalid Credentials**:

   ```json
   {
     "success": false,
     "error": {
       "code": "UNAUTHORIZED_ERROR",
       "message": "Invalid credentials"
     }
   }
   ```

2. **Token Expired**:
   - Frontend automatically attempts token refresh
   - If refresh fails, user is redirected to login

3. **Network Errors**:
   - User-friendly error messages displayed
   - Retry mechanisms for transient failures

### Error Messages

The frontend provides user-friendly error messages for:

- Invalid email/password
- Network connectivity issues
- Server errors
- Rate limiting
- Account lockout

## Security Features

### JWT Token Security

- Access tokens expire after 1 hour
- Refresh tokens are used for token renewal
- Tokens are stored securely in localStorage
- Automatic token refresh on expiration

### Request Security

- All authenticated requests include Bearer token
- HTTPS enforced in production
- CSRF protection via SameSite cookies

### Session Management

- Automatic session cleanup on logout
- Token invalidation on server logout
- Secure cookie settings

## Development vs Production

### Development

- Backend runs on `http://localhost:3005`
- Debug logging enabled
- Detailed error messages

### Production

- Backend runs on production URL
- Debug logging disabled
- Generic error messages for security

## Troubleshooting

### Common Issues

1. **Login Fails**:
   - Check backend is running on port 3005
   - Verify credentials are correct
   - Check network connectivity

2. **Token Refresh Issues**:
   - Clear localStorage and try again
   - Check refresh token validity
   - Verify backend refresh endpoint

3. **Session Persistence Issues**:
   - Check localStorage permissions
   - Verify cookie settings
   - Clear browser cache

### Debug Mode

Enable debug mode for detailed logging:

```env
NEXT_PUBLIC_DEBUG=true
```

This will show:

- API request/response details
- Token management operations
- Authentication state changes

## Next Steps

1. **Implement Office Settings**: Once authentication is working, implement the office settings module
2. **Add Role-Based Access**: Implement role-based routing and permissions
3. **Add Password Reset**: Implement forgot password functionality
4. **Add Email Verification**: Implement email verification flow
5. **Add Two-Factor Authentication**: Enhance security with 2FA

## Related Documentation

- [MSW Documentation](../api-mocking/README.md) - For offline development
- [Environment Setup](../basic-setup/getting-started.md) - Environment configuration
- [API Integration](../api/README.md) - General API integration guide
