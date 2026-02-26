# Contract Integration Layer

This directory contains integration modules for Stellar smart contracts.

## family-wallet.ts

Contract read/write layer for the family wallet functionality.

**Status**: Stubbed - awaiting contract deployment

**Functions**:
- `getMember(id | address)` - Retrieve member data
- `getAllMembers(admin?)` - List all members
- `buildAddMemberTx(...)` - Build add member transaction
- `buildUpdateSpendingLimitTx(...)` - Build update limit transaction
- `checkSpendingLimit(...)` - Verify spending allowance

See `/docs/FAMILY_WALLET_INTEGRATION.md` for complete documentation.
