# QuickBase Codepage Development Guide

Complete guide for developing QuickBase codepages using the QuickBase MCP Server.

## Table of Contents

1. [Getting Started](#getting-started)
2. [MCP Tools Overview](#mcp-tools-overview)
3. [Development Workflow](#development-workflow)
4. [Code Snippets](#code-snippets)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)
7. [Examples](#examples)

---

## Getting Started

### Prerequisites

- QuickBase account with app access
- User token (for MCP server)
- Node.js 18+ (for MCP server)
- Basic JavaScript knowledge

### Quick Start

1. **Configure MCP Server**
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

2. **Start Development**
   ```bash
   npm run build
   npm start
   ```

3. **Use MCP Tools** via Claude Code or any MCP client

---

## MCP Tools Overview

### Schema & Discovery Tools

#### `quickbase_get_table_schema`

Get full table schema organized for codepage development.

**Use Case**: Understanding table structure before coding

```javascript
// Returns:
{
  "tableId": "bvhuaz8wz",
  "userFields": [...],      // Editable fields
  "lookupFields": [...],    // Lookup fields
  "formulaFields": [...],   // Formula fields
  "systemFields": [...],    // System fields (Record ID, timestamps)
  "fieldMap": {             // Field name → ID mapping
    "msrp": 7,
    "discount": 8
  },
  "fieldTypes": {           // Field ID → type mapping
    "7": "currency",
    "8": "currency"
  }
}
```

**When to use**:
- Starting a new codepage project
- Understanding available fields
- Planning data model interactions

---

#### `quickbase_generate_field_map`

Generate JavaScript field mapping code.

**Output**:
```javascript
// QuickBase Field Mapping
const FIELDS = {
  RELATED_VEHICLE: 6, // Related Vehicle (numeric)
  MSRP: 7, // MSRP (currency)
  DISCOUNT: 8, // Discount (currency)
  FINANCING_RATE: 9, // Financing Rate (numeric)
  TRADE_IN_VALUE: 10, // Trade In Value (currency)
  FINAL_PRICE: 11, // Final Price (currency)
};
```

**When to use**:
- Copy/paste directly into your codepage
- Avoid magic numbers
- Maintain field references

---

### Code Generation Tools

#### `quickbase_get_code_snippet`

Get common code patterns for codepage development.

**Available Snippets**:

1. **session-auth-fetch** - Session-authenticated API calls
2. **create-record** - Create new records
3. **query-records** - Query records with filtering
4. **update-record** - Update existing records
5. **delete-record** - Delete records
6. **error-handling** - Robust error handling

**Example**:
```javascript
// Request snippet: 'create-record'
// Returns ready-to-use code:
const recordData = { 6: { value: 'Test' }, 7: { value: 123 } };
const result = await qbClient.createRecords(tableId, [recordData]);
const recordId = result.metadata.createdRecordIds[0];
```

---

### Testing & Validation Tools

#### `quickbase_validate_codepage`

Validate JavaScript code for syntax errors and best practices.

**Checks**:
- ✅ JavaScript syntax errors
- ✅ Code size (warns if >1MB)
- ✅ Session authentication usage
- ✅ Security best practices

**Example**:
```javascript
const code = readFileSync('my-codepage.js', 'utf-8');
const result = validateCodepageCode(code);

if (!result.valid) {
  console.log('Errors:', result.errors);
}
// Errors: ["JavaScript syntax error: Unexpected token"]
```

---

#### `quickbase_test_permissions`

Test what API operations are allowed for a table.

**Returns**:
```javascript
{
  "tableId": "bvhuaz8wz",
  "canRead": true,
  "canCreate": true,
  "canUpdate": true,
  "canDelete": false,
  "canGetFields": true,
  "errors": ["Delete: Permission denied"]
}
```

**When to use**:
- Before deploying codepage
- Debugging permission issues
- Planning feature implementation

---

#### `quickbase_test_load_codepage`

Test if a codepage is accessible and deployed correctly.

**Returns**:
```javascript
{
  "success": true,
  "size": 10240,
  "contentType": "text/javascript",
  "isJavaScript": true,
  "preview": "/**\n * QuickBase Codepage Hero..."
}
```

---

#### `quickbase_test_codepage_save`

Test saving data from a codepage to QuickBase.

**Example**:
```javascript
const testData = {
  7: { value: 35000 },  // MSRP
  8: { value: 2000 }    // Discount
};

// Returns:
{
  "success": true,
  "recordId": 42,
  "message": "Record created successfully",
  "metadata": {...}
}
```

---

### Deployment Tools

#### `quickbase_deploy_codepage`

Get step-by-step deployment instructions with code.

**Returns**:
```javascript
{
  "success": false,  // Manual deployment required
  "pageId": 3,
  "url": "https://realm.quickbase.com/db/appId?a=dbpage&pageID=3",
  "instructions": {
    "message": "QuickBase codepages must be deployed manually",
    "steps": [
      "1. Go to https://realm.quickbase.com/db/appId",
      "2. Click 'Pages' → 'Code Pages'",
      "3. Create or edit pageID=3",
      "4. Paste the code provided",
      "5. Save the codepage",
      "6. Access via: https://realm.quickbase.com/db/appId?a=dbpage&pageID=3"
    ],
    "code": "... full code ...",
    "codeSize": "10KB"
  }
}
```

---

## Development Workflow

### 1. Plan Your Codepage

```bash
# Get table schema
quickbase_get_table_schema --tableId "bvhuaz8wz"

# Test permissions
quickbase_test_permissions --tableId "bvhuaz8wz"
```

### 2. Generate Boilerplate

```bash
# Generate field mapping
quickbase_generate_field_map --tableId "bvhuaz8wz"

# Get code snippets
quickbase_get_code_snippet --snippetName "create-record"
quickbase_get_code_snippet --snippetName "error-handling"
```

### 3. Write Your Code

```javascript
<!DOCTYPE html>
<html>
<head>
    <title>My Codepage</title>
</head>
<body>
    <h1>QuickBase Application</h1>

    <!-- Load Hero Library -->
    <script src="?a=dbpage&pageID=3"></script>

    <script>
        // Use generated field map
        const FIELDS = {
          MSRP: 7,
          DISCOUNT: 8
        };

        // Use code snippets
        async function createRecord(data) {
            const recordData = {
                [FIELDS.MSRP]: { value: data.msrp },
                [FIELDS.DISCOUNT]: { value: data.discount }
            };

            const result = await qbClient.createRecords('bvhuaz8wz', [recordData]);
            return result.metadata.createdRecordIds[0];
        }
    </script>
</body>
</html>
```

### 4. Validate Your Code

```bash
# Validate syntax
quickbase_validate_codepage --code "$(cat my-codepage.html)"
```

### 5. Deploy

```bash
# Get deployment instructions
quickbase_deploy_codepage --appId "bvhuaz7" --pageId 2 --code "$(cat my-codepage.html)"
```

### 6. Test

```bash
# Test load
quickbase_test_load_codepage --appId "bvhuaz7" --pageId 2

# Test save
quickbase_test_codepage_save --tableId "bvhuaz8wz" --testData '{"7":{"value":35000}}'
```

---

## Code Snippets

### Session Authentication

```javascript
// Automatically included with Hero Library
// All requests use session cookies - no tokens needed!

// Example usage:
await qbClient.createRecords(tableId, [data]);
```

### Create Record

```javascript
async function createVehicle(make, model, year) {
  const recordData = {
    [FIELDS.MAKE]: { value: make },
    [FIELDS.MODEL]: { value: model },
    [FIELDS.YEAR]: { value: year }
  };

  const result = await qbClient.createRecords(TABLE_ID, [recordData]);
  return result.metadata.createdRecordIds[0];
}
```

### Query Records

```javascript
async function findVehiclesByMake(make) {
  const result = await qbClient.queryRecords(TABLE_ID, {
    select: [3, FIELDS.MAKE, FIELDS.MODEL, FIELDS.YEAR],
    where: `{${FIELDS.MAKE}.EX.'${make}'}`,
    top: 100
  });

  return result.data;
}
```

### Update Record

```javascript
async function updatePrice(recordId, newPrice) {
  await qbClient.updateRecords(TABLE_ID, [{
    3: { value: recordId },
    [FIELDS.PRICE]: { value: newPrice }
  }]);
}
```

### Delete Record

```javascript
async function deleteVehicle(recordId) {
  await qbClient.deleteRecords(TABLE_ID, [recordId]);
}
```

### Error Handling

```javascript
async function safeCreateRecord(data) {
  try {
    const recordId = await createVehicle(data.make, data.model, data.year);
    alert(`Vehicle created! ID: ${recordId}`);
    return recordId;
  } catch (error) {
    if (error.message.includes('Session expired')) {
      alert('Your session has expired. Please refresh the page.');
    } else if (error.message.includes('Permission denied')) {
      alert('You do not have permission to create records.');
    } else {
      alert(`Error: ${error.message}`);
    }
    console.error('Create failed:', error);
  }
}
```

---

## Best Practices

### 1. Use Session Authentication

✅ **Do**:
```javascript
// Hero library uses session cookies automatically
await qbClient.createRecords(tableId, [data]);
```

❌ **Don't**:
```javascript
// Never embed tokens in codepages!
const token = 'b3tqay_rwcp_0_...'; // ← SECURITY RISK
```

### 2. Use Field Constants

✅ **Do**:
```javascript
const FIELDS = {
  MSRP: 7,
  DISCOUNT: 8
};

recordData[FIELDS.MSRP] = { value: 35000 };
```

❌ **Don't**:
```javascript
recordData[7] = { value: 35000 }; // ← What is field 7?
```

### 3. Handle Errors Gracefully

✅ **Do**:
```javascript
try {
  await qbClient.createRecords(tableId, [data]);
  showSuccess('Record created!');
} catch (error) {
  console.error('Error:', error);
  showError(`Failed: ${error.message}`);
}
```

❌ **Don't**:
```javascript
await qbClient.createRecords(tableId, [data]);
// ← No error handling - will crash on failure
```

### 4. Validate Input

✅ **Do**:
```javascript
function validatePrice(price) {
  if (!price || price <= 0) {
    throw new Error('Price must be greater than 0');
  }
  if (price > 1000000) {
    throw new Error('Price seems unreasonably high');
  }
  return true;
}
```

### 5. Keep Code Organized

✅ **Do**:
```javascript
// Separate concerns
const CONFIG = { ... };
const FIELDS = { ... };

async function loadData() { ... }
async function saveData() { ... }
function validateData() { ... }
```

---

## Troubleshooting

### Common Issues

#### "Failed to load Hero library"

**Problem**: Script tag can't load from pageID=3

**Solutions**:
1. Verify Hero library is deployed to pageID=3
2. Check the script src path: `?a=dbpage&pageID=3`
3. Open browser console for detailed errors

---

#### "Session expired"

**Problem**: User session timed out

**Solutions**:
1. Refresh the page to re-establish session
2. Add auto-refresh on auth errors:
   ```javascript
   if (error.message.includes('Session expired')) {
     window.location.reload();
   }
   ```

---

#### "Permission denied"

**Problem**: User lacks table permissions

**Solutions**:
1. Check user role permissions in QuickBase
2. Use `quickbase_test_permissions` to identify missing permissions
3. Grant appropriate access in QuickBase UI

---

#### "Incompatible value for field"

**Problem**: Data type mismatch

**Solutions**:
1. Use `quickbase_get_table_schema` to check field types
2. Convert data appropriately:
   ```javascript
   // For numeric fields
   { value: parseFloat(inputValue) }

   // For currency fields
   { value: parseFloat(inputValue) }

   // For text fields
   { value: String(inputValue) }
   ```

---

## Examples

### Complete CRUD Application

See [MyDealership.html](MyDealership.html) for a full example with:
- Create, read, update, delete operations
- Field mapping
- Error handling
- Session authentication
- Professional UI

### Minimal Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Simple QuickBase App</title>
</head>
<body>
    <h1>Create Record</h1>
    <input id="name" placeholder="Name">
    <button onclick="save()">Save</button>

    <script src="?a=dbpage&pageID=3"></script>
    <script>
        const TABLE_ID = 'bvhuaz8wz';

        async function save() {
            const name = document.getElementById('name').value;

            const data = {
                6: { value: name }
            };

            try {
                const result = await qbClient.createRecords(TABLE_ID, [data]);
                alert(`Saved! ID: ${result.metadata.createdRecordIds[0]}`);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }
    </script>
</body>
</html>
```

---

## Additional Resources

- [QuickBase API Documentation](https://developer.quickbase.com/)
- [QuickBase Codepage Hero Library](quickbase_codepage_hero.js)
- [MCP Tools Documentation](CODEPAGE_MCP_TOOLS.md)
- [Session Authentication Guide](guides/Quickbase_Session_Auth_Codepage.md)

---

## Getting Help

1. Check this guide's troubleshooting section
2. Review browser console for error details
3. Use `quickbase_test_permissions` to diagnose access issues
4. Use `quickbase_validate_codepage` to check for code errors
5. See example codepages in this repository

---

## License

MIT License - See [LICENSE](LICENSE) for details
