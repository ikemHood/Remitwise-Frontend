# Implementation Plan: Session Refresh and Expiry

## Overview

This plan implements session expiry and refresh functionality for the Remitwise wallet-based authentication system. The implementation extends the existing session manager in `lib/session.ts`, adds middleware patterns for protected routes, creates frontend session handling, and includes comprehensive testing with both property-based and unit tests.

## Tasks

- [x] 1. Enhance Session Manager with expiry and refresh logic
  - [x] 1.1 Update SessionData interface to include createdAt and expiresAt timestamps
    - Add `createdAt: number` and `expiresAt: number` fields to SessionData interface
    - Update existing session creation to populate these fields
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Implement session creation with expiry timestamps
    - Modify `createSession` to calculate and store expiresAt based on SESSION_MAX_AGE
    - Store createdAt timestamp for audit purposes
    - Ensure iron-session encrypts all session data including timestamps
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.3 Write property test for session creation completeness
    - **Property 1: Session Creation Completeness**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 1.4 Write property test for session encryption round trip
    - **Property 2: Session Encryption Round Trip**
    - **Validates: Requirements 1.4**

  - [x] 1.5 Implement session validation logic
    - Create `isSessionValid` helper to check if current time < expiresAt
    - Update `getSession` to return null for expired sessions
    - Clear expired session cookies automatically
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 1.6 Write property tests for session expiry validation
    - **Property 3: Expired Session Rejection**
    - **Property 4: Valid Session Acceptance**
    - **Validates: Requirements 2.3, 2.4, 2.5**

  - [x] 1.7 Implement session refresh mechanism
    - Create `getSessionWithRefresh` function that validates and optionally refreshes sessions
    - Read SESSION_REFRESH_ENABLED environment variable
    - When enabled, extend expiresAt to current time + SESSION_MAX_AGE
    - Preserve original createdAt during refresh
    - Update session cookie with new expiresAt
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 1.8 Write property tests for session refresh behavior
    - **Property 5: Session Refresh Extension**
    - **Property 6: Session Refresh Disabled Preservation**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

  - [x] 1.9 Implement requireAuth helper function
    - Create convenience function that validates session or throws 401 Response
    - Return authenticated user data on success
    - _Requirements: 2.4, 2.5_

  - [x] 1.10 Add configuration support for session settings
    - Read SESSION_MAX_AGE environment variable with default of 604800 seconds
    - Read SESSION_REFRESH_ENABLED environment variable with default of "false"
    - Validate SESSION_PASSWORD is set and at least 32 characters
    - Handle invalid configuration values gracefully with fallbacks
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 1.11 Write property test for configurable session duration
    - **Property 11: Configurable Session Duration**
    - **Validates: Requirements 6.4**

  - [ ]* 1.12 Write unit tests for session manager functions
    - Test session creation with default and custom expiry
    - Test validation of valid, expired, corrupted, and missing sessions
    - Test refresh enabled and disabled scenarios
    - Test configuration handling and fallbacks
    - Test error conditions (missing password, invalid config)

- [x] 2. Checkpoint - Verify session manager implementation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement auth middleware pattern for protected routes
  - [x] 3.1 Create example protected route using getSessionWithRefresh
    - Add session validation at the start of route handler
    - Return 401 with "Session expired" message for invalid sessions
    - Include Set-Cookie header to clear expired cookies
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Create example protected route using requireAuth helper
    - Demonstrate try-catch pattern for automatic 401 handling
    - Show how to access authenticated user data
    - _Requirements: 2.4, 2.5_

  - [x] 3.3 Add session expiry logging to middleware
    - Log session expiry events with truncated wallet address and timestamp
    - Log session refresh events with truncated wallet address
    - Ensure no sensitive data (cookies, passwords) in logs
    - Use structured logging format for easy querying
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 3.4 Write property tests for session expiry logging
    - **Property 13: Session Expiry Logging**
    - **Property 14: Session Refresh Logging**
    - **Validates: Requirements 9.1, 9.2, 9.4**

  - [ ]* 3.5 Write unit tests for middleware patterns
    - Test valid session allows access
    - Test expired session returns 401 with correct message
    - Test missing session returns 401
    - Test requireAuth throws Response on invalid session
    - Test logging includes required fields without sensitive data

- [x] 4. Update logout endpoint
  - [x] 4.1 Implement centralized session clearing function
    - Create `clearSessionCookie` function that returns Set-Cookie header with Max-Age=0
    - Ensure cookie name and path match session cookie
    - _Requirements: 5.1, 5.2_

  - [x] 4.2 Update logout endpoint to use clearSessionCookie
    - Modify POST /api/auth/logout to call clearSessionCookie
    - Return 200 with success message
    - Include Set-Cookie header in response
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 4.3 Write property test for logout cookie clearing
    - **Property 9: Logout Cookie Clearing**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 4.4 Write unit tests for logout endpoint
    - Test logout clears session cookie
    - Test logout returns 200 with success message
    - Test logout works with and without existing session

- [x] 5. Checkpoint - Verify backend implementation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement frontend session expiry handling
  - [x] 6.1 Create session handler module
    - Create `lib/client/sessionHandler.ts` with SessionHandler interface
    - Implement `isSessionExpired` to detect 401 responses with "Session expired" message
    - Implement `clearAuthState` to remove local authentication state
    - Implement `handleSessionExpiry` to orchestrate expiry flow
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 6.2 Add session expiry detection to API client
    - Integrate session handler into API request wrapper
    - Intercept 401 responses and check for session expiry
    - Trigger expiry flow when detected
    - _Requirements: 4.1, 4.2_

  - [x] 6.3 Implement expiry UI messaging and redirect
    - Display user-friendly message: "Your session has expired. Please reconnect your wallet."
    - Redirect to wallet connection page
    - Preserve intended destination for post-auth redirect
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 6.4 Add logout redirect handling
    - Implement navigation to home or login page after successful logout
    - Clear local authentication state on logout
    - _Requirements: 5.4_

  - [ ]* 6.5 Write property tests for frontend session handling
    - **Property 7: Frontend Expiry State Clearing**
    - **Property 8: Frontend Expiry Redirect Preservation**
    - **Property 10: Frontend Logout Redirect**
    - **Validates: Requirements 4.1, 4.4, 5.4**

  - [ ]* 6.6 Write unit tests for frontend session handler
    - Test 401 detection triggers expiry flow
    - Test local state cleared on expiry
    - Test redirect to wallet connection
    - Test intended destination preserved
    - Test logout triggers navigation
    - Test network errors don't clear valid sessions

- [-] 7. Add environment variable configuration
  - [x] 7.1 Document environment variables in .env.example
    - Add SESSION_MAX_AGE with default value and description
    - Add SESSION_REFRESH_ENABLED with default value and description
    - Document SESSION_PASSWORD requirements (min 32 chars)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.2 Add configuration validation on server startup
    - Validate SESSION_PASSWORD is set and meets length requirement
    - Log warning for invalid SESSION_MAX_AGE and use default
    - Log info for SESSION_REFRESH_ENABLED status
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 7.3 Write unit tests for configuration handling
    - Test default values when env vars not set
    - Test custom values when env vars set
    - Test validation errors for invalid values
    - Test fallback behavior for invalid SESSION_MAX_AGE

- [~] 8. Add comprehensive documentation
  - [-] 8.1 Create session management documentation
    - Document session expiry mechanism and default 7-day duration
    - Explain sliding window refresh strategy and when it applies
    - Document all environment variables with examples
    - Provide frontend error handling examples for expired sessions
    - Include code examples for protected route implementation
    - Document concurrent session behavior across multiple tabs
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [-] 8.2 Add inline code comments
    - Comment session validation logic
    - Comment refresh mechanism
    - Comment configuration handling
    - Comment error handling patterns

- [ ] 9. Property-based testing implementation
  - [ ]* 9.1 Set up fast-check testing framework
    - Install fast-check as dev dependency
    - Configure Jest to run property tests
    - Create test file structure: tests/session/session.property.test.ts and tests/frontend/frontend.property.test.ts

  - [ ]* 9.2 Implement property test for concurrent session access
    - **Property 12: Concurrent Session Access**
    - **Validates: Requirements 8.1**
    - Generate concurrent requests to protected routes with same session
    - Verify all requests succeed or fail consistently without race conditions

  - [ ]* 9.3 Configure property test parameters
    - Set minimum 100 iterations per property test
    - Add property reference comments to each test
    - Use format: `// Feature: session-refresh-and-expiry, Property {number}: {property_text}`

- [~] 10. Final checkpoint - Integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across randomized inputs
- Unit tests validate specific examples, edge cases, and integration points
- The implementation uses TypeScript throughout, matching the existing Next.js codebase
- Session cookies use iron-session for encryption and are HTTP-only with SameSite=Lax
- All session state remains in encrypted cookies; no server-side session storage required
- Logging must never include sensitive data (encrypted cookies, passwords, full wallet addresses)
