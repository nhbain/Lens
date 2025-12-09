# Task 8.0 Proof Artifacts - Fix FileCard Remaining Items Count

## Summary

Verified that the FileCard remaining items count is correctly implemented as `total - complete`. Added explicit regression tests to document and verify the expected behavior as specified in the spec.

## Investigation Results

### FileCard.tsx (Line 109)
The implementation correctly displays remaining count:
```tsx
{file.progress.total - file.progress.complete} remaining
```

### useDashboard.ts calculateProgress Function
The function correctly calculates:
- `total`: Number of items in the document
- `complete`: Count of items with status 'complete'
- `inProgress`: Count of items with status 'in_progress'
- `pending`: `total - complete - inProgress`

The remaining count formula `total - complete` correctly includes both pending AND in_progress items.

## Tests Added

### useDashboard.test.tsx
Added test: "calculates remaining items as total minus complete"
- Spec scenario: 10 items, 3 complete, 2 in_progress, 5 pending
- Verifies: `total - complete = 10 - 3 = 7 remaining`

### FileCard.test.tsx
Added test: "displays remaining as total minus complete (spec scenario)"
- Creates file with: total=10, complete=3, inProgress=2, pending=5
- Expects: "7 remaining" displayed

## Test Results

### CLI Output - useDashboard and FileCard Tests

```
$ npm run test -- useDashboard.test.tsx FileCard.test.tsx

 ✓ src/hooks/useDashboard.test.tsx (24 tests) 8ms
 ✓ src/components/Dashboard/FileCard.test.tsx (32 tests) 115ms

 Test Files  2 passed (2)
      Tests  56 passed (56)
```

### CLI Output - Full Test Suite

```
$ npm run test

 Test Files  62 passed (62)
      Tests  1516 passed (1516)
   Start at  12:51:50
   Duration  4.80s
```

### CLI Output - Lint Check

```
$ npm run lint
> app@0.1.0 lint
> eslint src

(no errors)
```

## Files Modified

1. **app/src/hooks/useDashboard.test.tsx** - Added 1 test for remaining count calculation
2. **app/src/components/Dashboard/FileCard.test.tsx** - Added 1 test for remaining count display

## Conclusion

The implementation was already correct. No code changes were needed. The task focused on:
1. Verifying the existing implementation is correct
2. Adding explicit regression tests to document the expected behavior
3. Ensuring the spec scenario (10 items, 3 complete, 2 in_progress = 7 remaining) is explicitly tested
