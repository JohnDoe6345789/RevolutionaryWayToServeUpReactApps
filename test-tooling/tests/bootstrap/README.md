# Bootstrap Test Organization

This directory contains organized tests for the bootstrap system.

## Directory Structure

### Unit Tests (`unit/`)
Individual component and service tests organized by domain:

- **`core/`** - Core bootstrap functionality tests
  - `base-bootstrap-app.test.ts` - Core bootstrap application tests
  - `constants/` - Bootstrap constants tests
  - `controllers/` - Controller tests
  - `entrypoints/` - Entrypoint tests
  - `factories/` - Factory tests
  - `helpers/` - Helper utility tests
  - `initializers/` - Initializer tests
  - `interfaces/` - Interface tests
  - `local/` - Local development and compilation tests
  - `registries/` - Registry tests
  - `services/` - Individual service tests
    - `cdn/` - CDN-related service tests
      - `cdn-services.test.ts` - Consolidated CDN services tests
    - `local/` - Local development service tests
      - `local-services.test.ts` - Consolidated local services tests

### Integration Tests (`integration/`)
Cross-component and end-to-end tests:

- `core-classes.test.ts` - Critical bootstrap classes integration tests
- `bootstrap-integration.test.ts` - Bootstrap helper integration tests

### Test Helpers (`helpers/`)
Shared test utilities and setup files:

- Shared test utilities and mocks

### Fixtures (`fixtures/`)
Test data and mock objects:

- `data/` - Test data files
- `mocks/` - Mock objects and services

### Legacy Tests (`legacy/`)
Old or disabled test files preserved for reference:

- Old test files preserved for historical reference

## Test Naming Conventions

- **Unit tests**: `[component-name].test.ts`
- **Integration tests**: `[feature-name].test.ts`

## Import Paths

All tests should import from the actual bootstrap source:
```typescript
import ModuleName from "../../../../bootstrap/[path]/[module].js";
```

## Running Tests

Run unit tests:
```bash
npm test -- unit/
```

Run integration tests:
```bash
npm test -- integration/
```

Run all bootstrap tests:
```bash
npm test -- bootstrap/
```

## Migration Notes

This organization consolidates and simplifies the test structure:

- **Removed monikers**: No more `comprehensive`, `consolidated`, `specific`, `new`, `critical` naming
- **Merged duplicates**: Similar test files have been consolidated into single, focused test files
- **Simple naming**: Tests now have clear, descriptive names without redundant qualifiers
- **Maintained coverage**: All test functionality has been preserved while reducing file count from 32 to 11 test files

### Before Consolidation
- 32 test files with complex, overlapping names
- Multiple files testing the same components with slight variations
- Legacy and disabled files mixed with active tests

### After Consolidation  
- 11 test files with simple, clear naming
  - `cdn-services.test.ts` - All CDN service tests in one file
  - `local-services.test.ts` - All local service tests in one file
  - `services.test.ts` - Core service tests
  - `core-classes.test.ts` - Critical integration tests
  - `bootstrap-integration.test.ts` - Bootstrap integration tests
  - Plus 6 core, integration, and helper test files
- Clean separation of concerns with logical grouping
- Legacy files properly isolated

This new structure provides:
- **Better maintainability**: Fewer files, each with a clear purpose
- **Easier navigation**: Logical organization by domain and test type
- **Reduced complexity**: No more duplicate or overlapping test files
- **Preserved functionality**: All original test coverage maintained
