# Implementation Plan

- [x] 1. Set up project structure and validation utilities
  - Create `lib/contracts/` directory for transaction builders
  - Create `lib/validation/` directory for input validation functions
  - Create `lib/types/` directory for TypeScript interfaces
  - Set up environment variables for contract addresses and network configuration
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 2. Implement validation functions
  - Create validation utilities for amounts (positive number check)
  - Create validation utilities for dates (future date check)
  - Create validation utilities for goal IDs (non-empty string check)
  - Create validation utilities for goal names (length and format check)
  - _Requirements: 1.2, 1.3, 2.2, 2.3, 3.2, 3.3, 4.2, 5.2_

- [ ]* 2.1 Write property test for amount validation
  - **Property 1: Positive Amount Validation**
  - **Validates: Requirements 2.2, 3.2**

- [ ]* 2.2 Write property test for date validation
  - **Property 2: Future Date Validation**
  - **Validates: Requirements 1.3**

- [ ]* 2.3 Write property test for goal ID validation
  - **Property 6: Goal ID Validation**
  - **Validates: Requirements 2.3, 3.3, 4.2, 5.2**

- [x] 3. Implement transaction builder functions
  - Create `lib/contracts/savings-goals.ts` file
  - Implement `buildCreateGoalTx` function with Stellar SDK
  - Implement `buildAddToGoalTx` function
  - Implement `buildWithdrawFromGoalTx` function
  - Implement `buildLockGoalTx` function
  - Implement `buildUnlockGoalTx` function
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ]* 3.1 Write property test for XDR format validity
  - **Property 4: XDR Format Validity**
  - **Validates: Requirements 1.4, 2.5, 3.5, 4.4, 5.4**

- [x] 4. Implement session authentication utilities
  - Create `lib/auth/session.ts` for session extraction
  - Implement function to extract public key from session
  - Implement function to validate session existence
  - _Requirements: 2.4, 3.4, 4.3, 5.3_

- [ ]* 4.1 Write property test for authentication consistency
  - **Property 3: Authentication Consistency**
  - **Validates: Requirements 2.4, 3.4, 4.3, 5.3**

- [x] 5. Implement error handling utilities
  - Create `lib/errors/api-errors.ts` for error response formatting
  - Implement function to create 400 validation error responses
  - Implement function to create 401 authentication error responses
  - Implement function to create 500 server error responses
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 5.1 Write property test for error response structure
  - **Property 5: Error Response Structure**
  - **Validates: Requirements 6.1, 6.3**

- [ ] 6. Implement POST /api/goals endpoint
  - Create `app/api/goals/route.ts` file
  - Implement POST handler with request body parsing
  - Add validation for name, targetAmount, and targetDate
  - Add session authentication
  - Call `buildCreateGoalTx` and return XDR
  - Add error handling with appropriate status codes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 7. Implement POST /api/goals/[id]/add endpoint
  - Create `app/api/goals/[id]/add/route.ts` file
  - Implement POST handler with request body parsing
  - Add validation for amount parameter
  - Add session authentication
  - Call `buildAddToGoalTx` and return XDR
  - Add error handling with appropriate status codes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 8. Implement POST /api/goals/[id]/withdraw endpoint
  - Create `app/api/goals/[id]/withdraw/route.ts` file
  - Implement POST handler with request body parsing
  - Add validation for amount parameter
  - Add session authentication
  - Call `buildWithdrawFromGoalTx` and return XDR
  - Add error handling with appropriate status codes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 9. Implement POST /api/goals/[id]/lock endpoint
  - Create `app/api/goals/[id]/lock/route.ts` file
  - Implement POST handler
  - Add session authentication
  - Call `buildLockGoalTx` and return XDR
  - Add error handling with appropriate status codes
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 10. Implement POST /api/goals/[id]/unlock endpoint
  - Create `app/api/goals/[id]/unlock/route.ts` file
  - Implement POST handler
  - Add session authentication
  - Call `buildUnlockGoalTx` and return XDR
  - Add error handling with appropriate status codes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Create integration documentation
  - Create `docs/api/savings-goals-transactions.md` with API documentation
  - Document all endpoints with request/response examples
  - Document all transaction builder functions
  - Add example frontend integration code
  - Add error handling examples
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 13. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
