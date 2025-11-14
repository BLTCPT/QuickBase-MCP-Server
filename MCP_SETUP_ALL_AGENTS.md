# QuickBase MCP - Multi-Agent Setup Guide

Configure QuickBase MCP to work with multiple AI agents and IDEs.

## Supported Agents

- ✅ **Kiro.dev** - Configured
- ✅ **Claude Desktop** - Configured
- ✅ **VS Code + Claude/Copilot** - Uses Claude Desktop config
- ✅ **Any MCP-compatible client** - Use the config templates below

## Quick Status

All agents now have access to **47 QuickBase MCP tools** including:
- 8 new codepage management tools
- Full CRUD operations
- Schema management
- Code generation helpers
- Version control

## Configuration Files

### 1. Kiro.dev

**Location**: `.kiro/settings/mcp.json` (in this repository)

**Status**: ✅ Configured

**Features**:
- Auto-approves read-only operations
- Connected to app `bvhuaz7`
- Uses environment variable for token security

**To reload**: Restart Kiro.dev

### 2. Claude Desktop (Used by VS Code)

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Status**: ✅ Configured

**Features**:
- Same 47 tools as Kiro.dev
- Works with Claude Desktop app
- Automatically used by VS Code Claude extensions

**To reload**: Restart Claude Desktop app

### 3. VS Code Extensions

QuickBase MCP works with these VS Code extensions:

**Claude-powered extensions:**
- Use Claude Desktop config automatically
- No additional setup needed
- Just restart VS Code after configuring Claude Desktop

**GitHub Copilot:**
- Copilot doesn't natively support MCP (as of Nov 2024)
- Can use Claude Desktop alongside Copilot
- Use Claude for QuickBase operations, Copilot for general coding

### 4. Cursor IDE

**Location**: `~/.cursor/mcp.json` (if you use Cursor)

```json
{
  "mcpServers": {
    "quickbase": {
      "command": "node",
      "args": [
        "/Users/mark2/Documents/QB-MCP/QuickBase-MCP-Server/dist/index.js"
      ],
      "env": {
        "QB_REALM": "vibe.quickbase.com",
        "QB_USER_TOKEN": "b3tqay_rwcp_0_v89whgdnnhm4ec9uz5k9bvi268a",
        "QB_APP_ID": "bvhuaz7"
      }
    }
  }
}
```

### 5. Windsurf / Other MCP Clients

Use the same configuration format as above. Most MCP clients follow the standard:

```json
{
  "mcpServers": {
    "quickbase": {
      "command": "node",
      "args": ["<path-to-dist/index.js>"],
      "env": {
        "QB_REALM": "vibe.quickbase.com",
        "QB_USER_TOKEN": "<your-token>",
        "QB_APP_ID": "<your-app-id>"
      }
    }
  }
}
```

## Environment Variables (Recommended)

For better security, use environment variables instead of hardcoding tokens:

### Step 1: Add to shell profile

Add to `~/.zshrc` or `~/.bashrc`:

```bash
export QB_USER_TOKEN="b3tqay_rwcp_0_v89whgdnnhm4ec9uz5k9bvi268a"
```

Then reload:
```bash
source ~/.zshrc
```

### Step 2: Update configs to use variable

```json
{
  "env": {
    "QB_REALM": "vibe.quickbase.com",
    "QB_USER_TOKEN": "${QB_USER_TOKEN}",
    "QB_APP_ID": "bvhuaz7"
  }
}
```

Note: Kiro.dev already uses this pattern!

## Testing Your Setup

### Test with Kiro.dev

```
Ask: "List all tables in my QuickBase app using MCP"
```

### Test with Claude Desktop

1. Open Claude Desktop app
2. Start a new conversation
3. Look for the MCP tools icon (hammer/wrench)
4. Ask: "What QuickBase MCP tools do you have access to?"

### Test with VS Code

1. Install a Claude-powered extension
2. Restart VS Code
3. Use the extension to ask about QuickBase
4. It will use the Claude Desktop MCP config

## Verify MCP Server

Run this command to verify the server works:

```bash
cd /Users/mark2/Documents/QB-MCP/QuickBase-MCP-Server
node verify-mcp.js
```

Expected output:
```
✅ MCP Server working! Found 47 tools
```

## Available Tools by Category

### Application & Tables (6 tools)
- `quickbase_get_app_info` - App details
- `quickbase_get_tables` - List tables
- `quickbase_get_table_info` - Table metadata
- `quickbase_get_table_fields` - Field definitions
- `quickbase_create_table` - Create new table
- `quickbase_delete_table` - Remove table

### Records (9 tools)
- `quickbase_query_records` - Query with filters
- `quickbase_get_record` - Get by ID
- `quickbase_create_record` - Create new
- `quickbase_update_record` - Update existing
- `quickbase_delete_record` - Delete record
- `quickbase_bulk_create_records` - Batch create
- `quickbase_search_records` - Text search
- `quickbase_get_reports` - List reports
- `quickbase_run_report` - Execute report

### Codepage Management (13 tools)
- `quickbase_save_codepage` - Save new codepage ⭐
- `quickbase_get_codepage` - Retrieve codepage
- `quickbase_list_codepages` - List all
- `quickbase_update_codepage` - Update existing ⭐ NEW
- `quickbase_search_codepages` - Search/filter ⭐ NEW
- `quickbase_clone_codepage` - Clone with mods ⭐ NEW
- `quickbase_export_codepage` - Export HTML/JSON/MD ⭐ NEW
- `quickbase_import_codepage` - Import from file ⭐ NEW
- `quickbase_save_codepage_version` - Save version ⭐ NEW
- `quickbase_get_codepage_versions` - Version history ⭐ NEW
- `quickbase_rollback_codepage` - Restore version ⭐ NEW
- `quickbase_execute_codepage` - Run function
- `quickbase_deploy_codepage` - Deployment guide

### Schema Management (6 tools)
- `quickbase_create_field` - Add field
- `quickbase_update_field` - Modify field
- `quickbase_delete_field` - Remove field
- `quickbase_create_relationship` - Link tables
- `quickbase_get_relationships` - List relationships
- `quickbase_get_relationship_details` - Detailed info

### Development Helpers (8 tools)
- `quickbase_get_table_schema` - Schema for dev
- `quickbase_generate_field_map` - Generate constants
- `quickbase_get_code_snippet` - Code templates
- `quickbase_validate_codepage` - Syntax check
- `quickbase_test_permissions` - Check access
- `quickbase_test_load_codepage` - Test deployment
- `quickbase_test_connection` - Verify connection
- `quickbase_test_codepage_save` - Test save

### Authentication (1 tool)
- `quickbase_initiate_oauth` - OAuth flow

## Example Workflows

### With Any Agent

**1. Explore Your App**
```
"Show me all tables in my QuickBase app and their field counts"
```

**2. Generate Code**
```
"Generate a JavaScript field map for table bvhuaz8wz"
```

**3. Create a Codepage**
```
"Create a codepage that loads records from the pricing table and displays them in a sortable table with Material Design styling"
```

**4. Version Control**
```
"Save codepage 5 as version 1.0.0"
"Show me all versions of codepage 5"
"Rollback codepage 5 to version 1.0.0"
```

**5. Clone and Adapt**
```
"Clone codepage 3 and modify it to work with the vehicles table instead"
```

**6. Export and Share**
```
"Export codepage 7 as markdown documentation"
```

## Multi-Agent Workflow Example

You can use different agents for different tasks:

**Kiro.dev**: Planning and architecture
```
"Help me design a multi-table application for vehicle sales"
```

**Claude Desktop**: Quick queries and testing
```
"Test if I can read from table bvhuaz8wz"
```

**VS Code + Claude**: Code generation
```
"Generate a complete QuickBase codepage for the design we discussed"
```

## Troubleshooting

### MCP Server Not Found

**Symptom**: Agent says it can't find QuickBase tools

**Solution**:
1. Verify build: `ls /Users/mark2/Documents/QB-MCP/QuickBase-MCP-Server/dist/index.js`
2. Rebuild if needed: `npm run build`
3. Restart the agent/IDE

### Permission Errors

**Symptom**: 403 Forbidden or 401 Unauthorized

**Solution**:
1. Verify token: `echo $QB_USER_TOKEN`
2. Check token in config file is correct
3. Use `quickbase_test_permissions` to check access

### Tools Not Auto-Approved

**Symptom**: Agent asks for permission on every tool call

**Solution**:
1. Check `autoApprove` list in config
2. Add frequently-used read-only tools
3. Restart agent to apply changes

### Different App IDs

**Symptom**: Need to work with multiple QuickBase apps

**Solution**:
Create multiple MCP server configs:

```json
{
  "mcpServers": {
    "quickbase-production": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "QB_APP_ID": "bvhuaz7"
      }
    },
    "quickbase-development": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "QB_APP_ID": "btr3r3fk5"
      }
    }
  }
}
```

## Security Best Practices

1. **Use Environment Variables**: Don't hardcode tokens in config files
2. **Limit Auto-Approve**: Only auto-approve read-only operations
3. **Separate Configs**: Use different tokens for production vs development
4. **Token Rotation**: Regenerate QuickBase tokens periodically
5. **File Permissions**: Keep config files private (chmod 600)

## Keeping Updated

### Update MCP Server

```bash
cd /Users/mark2/Documents/QB-MCP/QuickBase-MCP-Server
git pull
npm install
npm run build
```

### Update Configs

After updating the server, restart all agents to pick up new tools.

### Check for New Tools

```bash
node verify-mcp.js
```

## Support & Documentation

- **Quick Start**: [KIRO_QUICK_START.md](KIRO_QUICK_START.md)
- **Kiro.dev Setup**: [KIRO_SETUP.md](KIRO_SETUP.md)
- **API Reference**: [CLAUDE.md](CLAUDE.md)
- **GitHub Issues**: https://github.com/mark-zellner/QuickBase-MCP-Server/issues

## Summary

✅ **Kiro.dev**: Configured via `.kiro/settings/mcp.json`
✅ **Claude Desktop**: Configured via `~/Library/Application Support/Claude/claude_desktop_config.json`
✅ **VS Code**: Uses Claude Desktop config automatically
✅ **Other Agents**: Use provided config templates

All agents now have access to the same 47 QuickBase MCP tools for building, managing, and deploying QuickBase applications!

**Happy coding!** 🚀
