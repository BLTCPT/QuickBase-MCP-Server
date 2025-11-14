# QuickBase MCP Server - Agent Instructions

## Overview

This is a Model Context Protocol (MCP) server providing full QuickBase database operations to AI agents. It enables agents to create tables, manage fields, query records, and handle relationships through standardized MCP tools.

## Architecture

- **Server**: TypeScript MCP server using `@modelcontextprotocol/sdk`
- **API Client**: Axios wrapper for QuickBase REST API v1
- **Tools**: Zod-validated MCP tools for all QuickBase operations
- **Transport**: Stdio-based communication with MCP clients

## Key Components

### MCP Server (`src/index.ts`)
- Handles tool listing and execution
- Routes requests to QuickBaseClient methods
- Returns JSON responses

### QuickBase Client (`src/quickbase/client.ts`)
- Axios instance with QuickBase-specific headers
- Request/response logging via interceptors
- Methods for apps, tables, fields, records

### Tools (`src/tools/index.ts`)
- Zod schemas for parameter validation
- Tool definitions with descriptions
- Support for all QuickBase field types

### Types (`src/types/quickbase.ts`)
- Zod enums for field types
- Interface definitions for QuickBase objects

## Data Flow

Agent Request → MCP Protocol → Server Handler → QuickBaseClient → HTTP API → QuickBase → Response

## Configuration

Required environment variables:
- `QB_REALM`: Your QuickBase realm hostname
- `QB_USER_TOKEN`: QuickBase user token
- `QB_APP_ID`: Application ID

Optional:
- `QB_DEFAULT_TIMEOUT`: Request timeout (default 30000ms)
- `QB_MAX_RETRIES`: Retry attempts (default 3)

## Development Workflow

### Setup
```bash
npm install
cp env.example .env
# Configure .env with your credentials
npm run setup
```

### Build & Run
```bash
npm run build    # Compile TypeScript
npm start        # Run server
npm run dev      # Development with watch mode
```

### Testing
```bash
npm test         # Basic API test
npm run test:jest # Unit tests
```

## QuickBase Specifics

### Identifiers
- **Table IDs**: String format like "bu65pc8px" (not names)
- **Field IDs**: Numeric IDs (not labels)
- **Record IDs**: Auto-generated numbers

### Field Types
Supported: text, numeric, date, checkbox, email, phone, url, file, lookup, formula, reference, etc.

### Authentication
Uses QB-USER-TOKEN in Authorization header with realm hostname.

### API Patterns
- GET for queries, POST for creation, PATCH for updates, DELETE for removal
- JSON payloads with fieldId: value pairs for records
- Query filtering using QuickBase syntax

## Tool Categories

### Application Tools
- `quickbase_get_app_info` - Get application information
- `quickbase_get_tables` - List all tables
- `quickbase_test_connection` - Test QuickBase connection

### Table Tools
- `quickbase_create_table` - Create new table
- `quickbase_get_table_info` - Get table details
- `quickbase_delete_table` - Delete table
- `quickbase_get_table_fields` - List table fields

### Field Tools
- `quickbase_create_field` - Create new field
- `quickbase_update_field` - Update field properties
- `quickbase_delete_field` - Delete field

### Record Tools
- `quickbase_query_records` - Query with filters/sorting
- `quickbase_get_record` - Get single record
- `quickbase_create_record` - Create new record
- `quickbase_update_record` - Update existing record
- `quickbase_delete_record` - Delete record
- `quickbase_bulk_create_records` - Batch create
- `quickbase_search_records` - Text search

### Relationship Tools
- `quickbase_create_relationship` - Basic relationship
- `quickbase_create_advanced_relationship` - With lookup fields
- `quickbase_create_lookup_field` - Add lookup field
- `quickbase_validate_relationship` - Check integrity
- `quickbase_get_relationship_details` - Detailed info
- `quickbase_create_junction_table` - Many-to-many
- `quickbase_get_relationships` - List relationships

### Codepage Lifecycle Tools
- `quickbase_save_codepage` - Save new codepage
- `quickbase_get_codepage` - Retrieve codepage
- `quickbase_list_codepages` - List all codepages
- `quickbase_update_codepage` - Update existing codepage
- `quickbase_search_codepages` - Search by name/tags/table
- `quickbase_clone_codepage` - Clone with modifications
- `quickbase_export_codepage` - Export (HTML/JSON/Markdown)
- `quickbase_import_codepage` - Import from external source
- `quickbase_save_codepage_version` - Save version snapshot
- `quickbase_get_codepage_versions` - Get version history
- `quickbase_rollback_codepage` - Rollback to previous version

### Codepage Development Tools
- `quickbase_deploy_codepage` - Get deployment instructions
- `quickbase_test_load_codepage` - Test codepage accessibility
- `quickbase_test_codepage_save` - Test save operation
- `quickbase_validate_codepage` - Validate code syntax
- `quickbase_get_table_schema` - Get schema for development
- `quickbase_generate_field_map` - Generate field ID constants
- `quickbase_get_code_snippet` - Get common code patterns
- `quickbase_test_permissions` - Test API permissions

### Report Tools
- `quickbase_get_reports` - List reports
- `quickbase_run_report` - Execute report

### Auth Tools
- `quickbase_initiate_oauth` - Start OAuth flow

## Tool Usage Examples

### Query Records
```json
{
  "tableId": "bu65pc8px",
  "select": [6, 7, 8],
  "where": "{6.EX.'Search Term'}",
  "top": 100
}
```

### Create Record
```json
{
  "tableId": "bu65pc8px",
  "fields": {
    "6": { "value": "John Doe" },
    "7": { "value": "john@example.com" },
    "8": { "value": 25 }
  }
}
```

### Update Codepage
```json
{
  "tableId": "codepages_table_id",
  "recordId": 123,
  "code": "// Updated code here",
  "version": "1.1.0",
  "active": true
}
```

### Search Codepages
```json
{
  "tableId": "codepages_table_id",
  "name": "customer",
  "tags": ["production", "v2"],
  "active": true,
  "limit": 10
}
```

### Clone Codepage
```json
{
  "tableId": "codepages_table_id",
  "recordId": 123,
  "newName": "Customer Form v2",
  "modifications": {
    "targetTable": "new_table_id",
    "description": "Modified for new table"
  }
}
```

### Export Codepage
```json
{
  "tableId": "codepages_table_id",
  "recordId": 123,
  "format": "html"
}
```

### Save Version
```json
{
  "tableId": "codepages_table_id",
  "recordId": 123,
  "versionNumber": "1.2.0",
  "notes": "Added validation logic"
}
```

### Rollback Codepage
```json
{
  "tableId": "codepages_table_id",
  "recordId": 123,
  "versionNumber": "1.1.0"
}
```

## Error Handling

- Network errors logged via axios interceptors
- Validation errors from Zod schemas
- QuickBase API errors returned as MCP errors
- Timeouts and retries configurable

## Integration Points

- **QuickBase API**: `https://api.quickbase.com/v1/`
- **MCP Clients**: Claude Desktop, other MCP-compatible apps
- **Dependencies**: axios, zod, dotenv, @modelcontextprotocol/sdk

## Codepage Lifecycle Management

The MCP server provides complete codepage lifecycle management:

### Development Workflow
1. **Create**: Use `quickbase_save_codepage` to create initial version
2. **Develop**: Use `quickbase_get_table_schema` and `quickbase_generate_field_map` for field mappings
3. **Test**: Use `quickbase_validate_codepage` to check syntax
4. **Version**: Use `quickbase_save_codepage_version` to create snapshots
5. **Deploy**: Use `quickbase_deploy_codepage` for deployment instructions
6. **Verify**: Use `quickbase_test_load_codepage` to confirm deployment

### Version Control
- Save version snapshots before major changes
- Use semantic versioning (1.0.0, 1.1.0, 2.0.0)
- Add descriptive notes to each version
- Rollback safely when needed

### Organization
- Use consistent naming conventions
- Tag codepages by purpose (production, development, testing)
- Link codepages to target tables
- Mark inactive codepages appropriately

### Distribution
- Export codepages in multiple formats:
  - **HTML**: Full page with script tags (ready to deploy)
  - **JSON**: Structured data with metadata
  - **Markdown**: Documentation-friendly format
- Import codepages from external sources
- Clone codepages for variations

### Search & Discovery
- Search by name, tags, or target table
- Filter by active/inactive status
- Limit results for large codepage libraries

## Best Practices

### General
- Always use table/field IDs, never names
- Handle pagination with `skip` and `top` parameters
- Use proper field types for data integrity
- Test connections before bulk operations
- Log API calls for debugging

### Codepage Development
- Always use session authentication in codepages (never user tokens)
- Generate field maps before coding to avoid hardcoded IDs
- Validate code before deployment
- Save versions before making breaking changes
- Test in development environment first
- Use codepage hero for session-based API calls
- Handle errors gracefully with try/catch blocks

## Reference Files

- `src/index.ts`: Server implementation
- `src/quickbase/client.ts`: API client
- `src/tools/index.ts`: Tool definitions
- `src/types/quickbase.ts`: Data schemas

---

## 🔐 Session Authentication for Codepages

**IMPORTANT**: When building QuickBase codepages, **ALWAYS use session authentication** - **NEVER use user tokens** in embedded codepages.

### Why Session Auth?

- **Automatic**: No manual token management when embedded in QuickBase
- **Secure**: Tied to user's active session
- **Seamless**: Works transparently when codepage is loaded
- **Best Practice**: Industry standard for embedded applications

### ❌ NEVER Use User Tokens in Codepages

```javascript
// WRONG - Don't do this in codepages
const response = await fetch('https://api.quickbase.com/v1/records', {
    headers: {
        'Authorization': `QB-USER-TOKEN ${userToken}`, // ❌ BAD
        'QB-Realm-Hostname': realm
    }
});
```

### ✅ CORRECT - Use Session Authentication

```javascript
// CORRECT - Session auth in codepages
(function loadQuickBaseClient(){
    const IS_QB = /quickbase\.com$/i.test(location.hostname);
    const CODEPAGE = '/db/[realm]?a=dbpage&pageID=[hero_page_id]';
    const LOCAL = 'quickbase_codepage_hero.js';

    // ... resilient loader implementation ...

    (async function run(){
        if (IS_QB) {
            if (await attemptScript(CODEPAGE) && exportClient('script')) return;
            // ... other strategies ...
        }
        // ... fallback to shim ...
    })();
})();

// Then use the client
async function saveData(tableId, recordData) {
    if (typeof window.qbClient !== 'undefined' && window.qbClient.mode !== 'shim') {
        const client = new window.qbClient();
        return await client.post('records', {
            to: tableId,
            data: [recordData]
        });
    }
}
```

### Codepage Hero Deployment

1. **Deploy Codepage Hero**: Create a separate QuickBase codepage with `quickbase_codepage_hero.js`
2. **Note Page ID**: Record the assigned page ID (e.g., pageID=3)
3. **Reference in Code**: Use `/db/[realm]?a=dbpage&pageID=[id]` in your codepage

### Save Data Example

```javascript
const FIELD_IDS = {
    name: 6,
    email: 7,
    amount: 8
};

async function saveToQuickBase() {
    const recordData = {
        [FIELD_IDS.name]: { value: 'John Doe' },
        [FIELD_IDS.email]: { value: 'john@example.com' },
        [FIELD_IDS.amount]: { value: 150.00 }
    };

    try {
        const client = new window.qbClient();
        const response = await client.post('records', {
            to: 'your_table_id',
            data: [recordData]
        });
        console.log('Saved successfully:', response);
    } catch (error) {
        console.error('Save failed:', error);
    }
}
```

### Look Up Data Example

```javascript
async function findRecords(tableId, searchTerm) {
    const client = new window.qbClient();
    const response = await client.get('records', {
        from: tableId,
        where: `{6.EX.'${searchTerm}'}`, // Field 6 contains search term
        select: [6, 7, 8] // Return specific fields
    });
    return response.data;
}
```

### Key Takeaways

- **Session Auth Only**: Never use user tokens in codepages
- **Codepage Hero**: Deploy as separate codepage, reference by pageID
- **Field IDs**: Always use numeric field IDs, never names
- **Error Handling**: Check if client is available before using
- **Environment Aware**: Code works in both QuickBase and development

See `MyDealership.html` for a complete working example of session authentication in a codepage.