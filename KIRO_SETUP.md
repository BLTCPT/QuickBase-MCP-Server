# Kiro.dev Agent Setup for QuickBase MCP

This guide will help you configure the Kiro.dev agent to use all the new QuickBase MCP tools.

## Quick Start

### 1. Set Environment Variable

You need to set your QuickBase user token as an environment variable. Add this to your shell profile (`.zshrc`, `.bashrc`, or `.bash_profile`):

```bash
export QB_USER_TOKEN="your_quickbase_user_token_here"
```

Or for the current session only:

```bash
export QB_USER_TOKEN="b3tqay_rwcp_0_v89whgdnnhm4ec9uz5k9bvi268a"
```

### 2. Verify MCP Configuration

Your MCP configuration is already set up at:
```
/Users/mark2/Documents/QB-MCP/QuickBase-MCP-Server/.kiro/settings/mcp.json
```

The configuration includes:
- **App ID**: `bvhuaz7` (your work app)
- **Realm**: `vibe.quickbase.com`
- **Auto-approved tools**: All read-only and safe tools

### 3. Test the Connection

Restart Kiro.dev or reload the MCP servers, then try:

```
Ask the agent: "Can you list all tables in my QuickBase app using MCP?"
```

## Available MCP Tools

### Read-Only Tools (Auto-Approved)
These tools are automatically approved and won't require confirmation:

**Application & Tables:**
- `quickbase_get_app_info` - Get app information
- `quickbase_get_tables` - List all tables
- `quickbase_get_table_info` - Get table details
- `quickbase_get_table_fields` - Get field definitions

**Records (Read):**
- `quickbase_query_records` - Query with filters/sorting
- `quickbase_get_record` - Get specific record
- `quickbase_search_records` - Text search
- `quickbase_get_reports` - List reports
- `quickbase_run_report` - Execute report

**Codepage Management (Read):**
- `quickbase_list_codepages` - List codepages
- `quickbase_get_codepage` - Get codepage details
- `quickbase_search_codepages` - Search codepages
- `quickbase_get_codepage_versions` - Get version history
- `quickbase_export_codepage` - Export as HTML/JSON/Markdown

**Development Helpers:**
- `quickbase_get_table_schema` - Get schema for codepage dev
- `quickbase_generate_field_map` - Generate field constants
- `quickbase_get_code_snippet` - Get code templates
- `quickbase_validate_codepage` - Validate JavaScript code
- `quickbase_test_permissions` - Check API permissions
- `quickbase_test_load_codepage` - Test codepage deployment

**Relationships:**
- `quickbase_get_relationships` - List relationships
- `quickbase_get_relationship_details` - Detailed relationship info

### Write Tools (Requires Confirmation)
These tools modify data and will ask for confirmation:

**Records (Write):**
- `quickbase_create_record` - Create new record
- `quickbase_update_record` - Update existing record
- `quickbase_delete_record` - Delete record
- `quickbase_bulk_create_records` - Create multiple records

**Codepage Management (Write):**
- `quickbase_save_codepage` - Save new codepage
- `quickbase_update_codepage` - Update existing codepage
- `quickbase_clone_codepage` - Clone codepage
- `quickbase_import_codepage` - Import from external source
- `quickbase_save_codepage_version` - Create version snapshot
- `quickbase_rollback_codepage` - Restore previous version

**Schema Management:**
- `quickbase_create_table` - Create new table
- `quickbase_create_field` - Add field to table
- `quickbase_update_field` - Modify field
- `quickbase_delete_field` - Remove field
- `quickbase_create_relationship` - Create table relationship
- `quickbase_create_advanced_relationship` - Advanced relationship with lookups

## Example Workflows

### 1. Explore Your QuickBase App

```
"List all tables in my QuickBase app and show me their fields"
```

### 2. Query Records

```
"Get the first 10 records from table bvhuaz8wz with fields 3, 6, 7, 8"
```

### 3. Generate Code for a Table

```
"Generate a field map for table bvhuaz8wz so I can use it in my codepage"
```

### 4. Export a Codepage

```
"Export codepage record 1 from table bvhuaz8wz as JSON"
```

### 5. Create a New Codepage

```
"Create a new codepage that loads all records from table bvhuaz8wz and displays them in a table"
```

### 6. Clone and Modify

```
"Clone codepage record 5 and modify it to work with a different table"
```

## Troubleshooting

### MCP Server Not Starting

1. Make sure you've built the project:
   ```bash
   cd /Users/mark2/Documents/QB-MCP/QuickBase-MCP-Server
   npm run build
   ```

2. Check that the dist folder exists:
   ```bash
   ls dist/index.js
   ```

3. Test the MCP server manually:
   ```bash
   QB_REALM="vibe.quickbase.com" \
   QB_USER_TOKEN="your_token" \
   QB_APP_ID="bvhuaz7" \
   node dist/index.js
   ```

### Environment Variable Not Working

Kiro.dev needs access to environment variables. Make sure:

1. The variable is exported in your shell profile
2. You've restarted your terminal or run `source ~/.zshrc`
3. Kiro.dev has been restarted after setting the variable

Alternative: Set the token directly in the MCP config (less secure):

```json
{
  "env": {
    "QB_REALM": "vibe.quickbase.com",
    "QB_USER_TOKEN": "b3tqay_rwcp_0_v89whgdnnhm4ec9uz5k9bvi268a",
    "QB_APP_ID": "bvhuaz7"
  }
}
```

### Permission Denied Errors

If you get 403 errors:
1. Verify your user token is valid
2. Check that you have permissions for the app/table
3. Use `quickbase_test_permissions` to check what you can do

## Advanced Usage

### Working with Multiple Apps

You can add multiple QuickBase MCP servers for different apps:

```json
{
  "mcpServers": {
    "quickbase-production": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "QB_REALM": "vibe.quickbase.com",
        "QB_USER_TOKEN": "${QB_USER_TOKEN}",
        "QB_APP_ID": "bvhuaz7"
      }
    },
    "quickbase-development": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "QB_REALM": "vibe.quickbase.com",
        "QB_USER_TOKEN": "${QB_USER_TOKEN}",
        "QB_APP_ID": "btr3r3fk5"
      }
    }
  }
}
```

### Custom Auto-Approve Lists

You can customize which tools are auto-approved based on your workflow. For example, if you want to auto-approve record creation:

```json
"autoApprove": [
  "quickbase_get_tables",
  "quickbase_create_record",  // Added
  "quickbase_update_record"   // Added
]
```

## Next Steps

1. **Build a Codepage**: Use the MCP to generate a codepage that loads/saves data
2. **Version Control**: Create version snapshots before making changes
3. **Export/Share**: Export codepages as JSON to share with team members
4. **Automate**: Use the MCP tools to automate repetitive QuickBase tasks

## Support

- GitHub Issues: https://github.com/mark-zellner/QuickBase-MCP-Server/issues
- QuickBase API Docs: https://developer.quickbase.com/
- MCP Documentation: https://modelcontextprotocol.io/

## Example Session

Here's a complete example of using Kiro.dev with QuickBase MCP:

```
You: "List all tables in my QuickBase app"
Agent: [Uses quickbase_get_tables]
       "Found 3 tables: Vehicles (bvhuaz7s5), Pricing (bvhuaz8wz), Customers (bvhuaz9ab)"

You: "Generate a field map for the Pricing table"
Agent: [Uses quickbase_generate_field_map with tableId="bvhuaz8wz"]
       "Here's the field map:
       const FIELDS = {
         RELATED_VEHICLE: 6,
         MSRP: 7,
         DISCOUNT: 8,
         ...
       }"

You: "Create a codepage that loads all pricing records and displays them"
Agent: [Uses quickbase_save_codepage]
       "I've created a new codepage with record ID 42. Here's what it does:
       - Loads all records from the Pricing table
       - Displays them in a formatted table
       - Uses session authentication for security
       You can access it at: https://vibe.quickbase.com/db/bvhuaz7?a=dbpage&pageID=42"
```

Happy coding with QuickBase MCP! 🚀
