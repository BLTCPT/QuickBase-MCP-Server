# QuickBase Codepage MCP Tools

The QuickBase MCP server now includes comprehensive tools for working with QuickBase codepages, including deployment instructions, validation, and testing.

## New MCP Tools

### 1. `quickbase_deploy_codepage`

Get deployment instructions for QuickBase built-in codepages (pageID-based).

**Parameters:**
- `appId` (string, required): QuickBase application ID (e.g., "bvhuaz7")
- `pageId` (number, required): Page ID for the codepage (e.g., 2, 3)
- `code` (string, required): JavaScript code to deploy
- `pageName` (string, optional): Name for the codepage

**Returns:**
```json
{
  "success": false,
  "pageId": 3,
  "url": "https://realm.quickbase.com/db/appId?a=dbpage&pageID=3",
  "instructions": {
    "message": "QuickBase codepages must be deployed manually through the UI",
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

**Example:**
```javascript
const result = await client.deployToCodepage('bvhuaz7', 3, heroLibraryCode);
console.log(result.url);
console.log(result.instructions.steps);
```

---

### 2. `quickbase_test_load_codepage`

Test if a codepage is accessible and properly deployed by attempting to load it via HTTP.

**Parameters:**
- `appId` (string, required): QuickBase application ID
- `pageId` (number, required): Page ID of the codepage to test

**Returns:**
```json
{
  "success": true,
  "size": 10240,
  "contentType": "text/javascript",
  "isJavaScript": true,
  "preview": "/**\n * QuickBase Codepage Hero..."
}
```

**Example:**
```javascript
const result = await client.testLoadCodepage('bvhuaz7', 3);
if (result.success) {
  console.log(`Codepage loaded: ${result.size} bytes`);
  console.log(`Is JavaScript: ${result.isJavaScript}`);
}
```

---

### 3. `quickbase_test_codepage_save`

Test saving data from a codepage to QuickBase (simulates codepage save operation).

**Parameters:**
- `tableId` (string, required): Table ID to save data to
- `testData` (object, required): Test record data in QuickBase format (field IDs as keys)

**Example Test Data:**
```json
{
  "7": { "value": 35000 },
  "8": { "value": 2000 },
  "9": { "value": 4.5 }
}
```

**Returns:**
```json
{
  "success": true,
  "recordId": 42,
  "message": "Record created successfully via codepage-style save",
  "metadata": {
    "createdRecordIds": [42],
    "totalNumberOfRecordsProcessed": 1
  }
}
```

**Example:**
```javascript
const testData = {
  7: { value: 35000 },  // MSRP
  8: { value: 2000 }    // Discount
};
const result = await client.testCodepageSave('bvhuaz8wz', testData);
console.log(`Record created: ${result.recordId}`);
```

---

### 4. `quickbase_validate_codepage`

Validate codepage code for syntax errors and best practices.

**Parameters:**
- `code` (string, required): JavaScript code to validate

**Returns:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    "Code makes HTTP requests but may not be using session authentication"
  ]
}
```

**Example:**
```javascript
const code = readFileSync('my-codepage.js', 'utf-8');
const result = client.validateCodepageCode(code);

if (!result.valid) {
  console.log('Errors:', result.errors);
}
if (result.warnings.length > 0) {
  console.log('Warnings:', result.warnings);
}
```

---

## Complete Workflow Example

```javascript
import { QuickBaseClient } from './dist/quickbase/client.js';
import { readFileSync } from 'fs';

const client = new QuickBaseClient({
  realm: 'vibe.quickbase.com',
  userToken: 'YOUR_TOKEN',
  appId: 'bvhuaz7',
  timeout: 30000,
  maxRetries: 3
});

// 1. Read your codepage code
const code = readFileSync('./quickbase_codepage_hero.js', 'utf-8');

// 2. Validate the code
const validation = client.validateCodepageCode(code);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  process.exit(1);
}
console.log('✅ Code is valid');

// 3. Get deployment instructions
const deployment = await client.deployToCodepage('bvhuaz7', 3, code);
console.log('Deploy to:', deployment.url);
console.log('Steps:', deployment.instructions.steps);

// 4. Manually deploy via QuickBase UI following the steps

// 5. Test that the codepage loaded correctly
const loadTest = await client.testLoadCodepage('bvhuaz7', 3);
if (loadTest.success) {
  console.log('✅ Codepage is accessible');
  console.log('Size:', loadTest.size, 'bytes');
}

// 6. Test save functionality
const testData = {
  7: { value: 35000 },
  8: { value: 2000 }
};
const saveTest = await client.testCodepageSave('bvhuaz8wz', testData);
if (saveTest.success) {
  console.log('✅ Save test successful, record ID:', saveTest.recordId);
}
```

---

## Using via MCP Protocol

These tools are exposed via the MCP protocol and can be called from any MCP client (like Claude Code):

```typescript
// Example MCP call
{
  "method": "tools/call",
  "params": {
    "name": "quickbase_validate_codepage",
    "arguments": {
      "code": "const qbClient = { ... }"
    }
  }
}
```

---

## Key Features

### ✅ What These Tools Do:

1. **Validate** codepage code for:
   - JavaScript syntax errors
   - Security best practices
   - Session authentication usage
   - Code size warnings

2. **Provide deployment instructions** including:
   - Step-by-step UI workflow
   - Direct QuickBase URLs
   - Code preview and size

3. **Test codepage accessibility** by:
   - HTTP loading the deployed page
   - Detecting JavaScript content
   - Verifying content type

4. **Simulate save operations** to:
   - Test QuickBase API integration
   - Verify authentication works
   - Validate field mappings

### ⚠️ Limitations:

- **Cannot automate deployment**: QuickBase codepages must be deployed manually through the UI
- **No direct API**: QuickBase doesn't provide a REST API for codepage management
- **Manual steps required**: Users must copy/paste code into the QuickBase UI

---

## Testing

Run the test suite:

```bash
QB_REALM="vibe.quickbase.com" \
QB_USER_TOKEN="your_token" \
QB_APP_ID="bvhuaz7" \
node test-codepage-tools.js
```

Expected output:
```
✅ All tests completed!

📝 Summary:
   • Validation: Tests code syntax and best practices
   • Deployment: Provides manual deployment instructions
   • Load Test: Checks if codepage is accessible
   • Save Test: Simulates codepage save operations
```

---

## Best Practices

1. **Always validate first** before deploying
2. **Test load** after manual deployment to verify
3. **Test save** with sample data to ensure API integration works
4. **Use session authentication** (credentials: 'include') in codepages
5. **Keep code size reasonable** (<100KB for best performance)
6. **Version your codepages** using comments or naming conventions

---

## Troubleshooting

### Validation Errors

**Problem**: "JavaScript syntax error"
- **Solution**: Check your code for typos, missing brackets, or invalid syntax

**Problem**: "Code contains user token references"
- **Solution**: Use session authentication instead of embedding tokens

### Load Test Failures

**Problem**: "Failed to load codepage"
- **Solution**: Verify the codepage is deployed and pageID is correct

**Problem**: "Size: 0 bytes"
- **Solution**: Codepage may be empty or not yet deployed

### Save Test Failures

**Problem**: "Incompatible value for field"
- **Solution**: Check field types match your test data (numeric vs. text)

**Problem**: "Permission denied"
- **Solution**: Verify user token has write access to the table

---

## Related Files

- [quickbase_codepage_hero.js](quickbase_codepage_hero.js) - Session auth library
- [MyDealership.html](MyDealership.html) - Example codepage application
- [test-codepage-tools.js](test-codepage-tools.js) - Test suite
- [deploy-to-quickbase.js](deploy-to-quickbase.js) - Deployment helper script

---

## Support

For issues or questions about these MCP tools, see:
- [QuickBase MCP Server README](README.md)
- [QuickBase API Documentation](https://developer.quickbase.com/)
- [Session Authentication Guide](guides/Quickbase_Session_Auth_Codepage.md)
