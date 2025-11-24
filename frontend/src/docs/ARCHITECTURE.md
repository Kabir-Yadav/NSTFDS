# Dispatch System Architecture

## Overview

This document explains the architecture of the dispatch system, showing how the logic layer is separated from the UI layer for easier maintenance and database integration.

## Architecture Layers

### 1. **Models Layer** (`src/models/`)

Pure data models with validation and serialization logic.

- `dispatchModels.js` - `Dispatch` and `DispatchComponent` classes
- `projectComponents.js` - Project component definitions

**Purpose**: Define data structures and business rules.

### 2. **Utils Layer** (`src/utils/`)

Pure functions with no side effects. Easy to test and reuse.

- `dispatchUtils.js` - Data transformation, validation, calculations

**Purpose**: Reusable utility functions for dispatch operations.

### 3. **Service Layer** (`src/services/`)

Business logic and data access abstraction.

- `dispatchService.js` - Main service interface for dispatch operations
- `spaceLabDummyData.js` - Data source (can be swapped with database)

**Purpose**: Abstract data access. To connect to a database, just update the service layer.

### 4. **UI Layer** (`src/components/` & `src/view/`)

React components that use the service layer.

- Components only call service functions
- No direct data access
- No business logic in components

**Purpose**: Display data and handle user interactions.

## Data Flow

```
UI Component
    ↓
Service Layer (dispatchService.js)
    ↓
Data Source (spaceLabDummyData.js or Database)
    ↓
Models (dispatchModels.js)
    ↓
Utils (dispatchUtils.js) - for transformations
```

## How to Connect to Database

### Step 1: Update Service Layer

In `src/services/dispatchService.js`, replace the data source imports:

```javascript
// OLD: Import from dummy data
import { fetchSpaceLabSchools } from "./spaceLabDummyData";

// NEW: Import from database service
import { fetchSchoolsFromDB } from "./databaseService";
```

### Step 2: Update Function Implementations

Update each function to call your database instead:

```javascript
export async function fetchSchools() {
  try {
    // Replace this:
    // const result = await fetchSpaceLabSchools();

    // With this:
    const result = await fetchSchoolsFromDB();
    return result;
  } catch (error) {
    return { data: null, error: error.message };
  }
}
```

### Step 3: Keep the Same Interface

The service layer functions should always return `{ data, error }` format. This way, UI components don't need to change.

## File Structure

```
src/
├── models/              # Data models
│   ├── dispatchModels.js
│   └── projectComponents.js
├── utils/               # Pure utility functions
│   └── dispatchUtils.js
├── services/            # Business logic & data access
│   ├── dispatchService.js  # Main service interface
│   └── spaceLabDummyData.js # Current data source
├── components/          # UI components
│   └── project_components/
│       ├── AddDispatchDialog.jsx
│       ├── DispatchDetailsRow.jsx
│       └── DispatchInfoModal.jsx
└── view/                # Page views
    └── psu_form/
        └── psu_Selection_form.jsx
```

## Key Principles

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Dependency Direction**: UI → Service → Data Source
3. **No Business Logic in UI**: All logic in service/utils layers
4. **Consistent Interface**: All service functions return `{ data, error }`
5. **Easy Testing**: Utils are pure functions, easy to unit test

## Adding New Features

### Adding a New Dispatch Operation

1. Add utility function in `dispatchUtils.js` (if needed)
2. Add service function in `dispatchService.js`
3. Update data source in `spaceLabDummyData.js` (or database)
4. Use in UI component

### Example: Adding "Delete Dispatch"

**Step 1**: Add to `dispatchService.js`

```javascript
export async function deleteDispatch(schoolId, dispatchId) {
  try {
    const result = await deleteDispatchData(schoolId, dispatchId);
    return result;
  } catch (error) {
    return { data: null, error: error.message };
  }
}
```

**Step 2**: Add to data source (`spaceLabDummyData.js` or database)

```javascript
export const deleteDispatchData = async (schoolId, dispatchId) => {
  // Implementation here
};
```

**Step 3**: Use in component

```javascript
import { deleteDispatch } from "../../services/dispatchService";

const handleDelete = async () => {
  const { error } = await deleteDispatch(schoolId, dispatchId);
  if (error) {
    alert(error);
  } else {
    // Refresh data
  }
};
```

## Benefits

✅ **Easy Database Migration**: Just update service layer  
✅ **Testable**: Utils are pure functions  
✅ **Maintainable**: Clear separation of concerns  
✅ **Scalable**: Easy to add new features  
✅ **Reusable**: Utils can be used anywhere
