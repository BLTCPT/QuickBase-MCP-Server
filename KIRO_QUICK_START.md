# QuickBase MCP + Kiro.dev - Quick Start

## ✅ Setup Complete!

Your QuickBase MCP server is configured and ready to use with Kiro.dev.

- **47 total MCP tools** available
- **8 new codepage management tools** added
- **Auto-approved read operations** for faster workflow

## 🚀 Getting Started

### 1. Restart Kiro.dev

After updating the MCP configuration, restart Kiro.dev to load the new tools.

### 2. Try These Commands

**Explore your app:**
```
"List all tables in my QuickBase app"
```

**Get table details:**
```
"Show me the fields in table bvhuaz8wz"
```

**Query records:**
```
"Get 5 records from the pricing table (bvhuaz8wz)"
```

**Generate code:**
```
"Generate a field map constant for table bvhuaz8wz"
```

**Work with codepages:**
```
"List all codepages in table bvhuaz8wz"
"Export codepage 1 as JSON"
"Search for codepages with 'pricing' in the name"
```

## 🎯 Common Workflows

### Create a New Codepage

```
"Create a codepage that:
1. Loads all records from table bvhuaz8wz
2. Displays them in a sortable table
3. Has a button to add new records
4. Uses session authentication"
```

The agent will:
- Generate the field map
- Create the HTML/JavaScript code
- Save it to QuickBase
- Give you the URL to access it

### Clone and Modify

```
"Clone codepage 5 and modify it to work with table bvhuaz7s5 instead"
```

### Version Control

```
"Save a version snapshot of codepage 3 as version 1.0.0"
"Show me the version history for codepage 3"
"Rollback codepage 3 to version 1.0.0"
```

### Export for Sharing

```
"Export codepage 7 as markdown so I can share it with my team"
```

## 🔧 Configuration

Your MCP config: `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "quickbase": {
      "command": "node",
      "args": ["/Users/mark2/Documents/QB-MCP/QuickBase-MCP-Server/dist/index.js"],
      "env": {
        "QB_REALM": "vibe.quickbase.com",
        "QB_USER_TOKEN": "${QB_USER_TOKEN}",
        "QB_APP_ID": "bvhuaz7"
      }
    }
  }
}
```

## 🆕 New Tools Available

### Codepage Management
- ✅ `quickbase_update_codepage` - Update code/description/version
- ✅ `quickbase_search_codepages` - Search by name/tags/table
- ✅ `quickbase_clone_codepage` - Clone with modifications
- ✅ `quickbase_export_codepage` - Export as HTML/JSON/Markdown
- ✅ `quickbase_import_codepage` - Import from file/URL
- ✅ `quickbase_save_codepage_version` - Version snapshots
- ✅ `quickbase_get_codepage_versions` - Version history
- ✅ `quickbase_rollback_codepage` - Restore previous version

### Already Available
- All CRUD operations (Create, Read, Update, Delete)
- Table and field management
- Relationship management
- Schema introspection
- Code generation helpers
- Permission testing

## 💡 Pro Tips

1. **Use Natural Language**: The agent understands context, so you can say things like "use the pricing table" instead of "use table bvhuaz8wz"

2. **Chain Operations**: "First generate a field map for the vehicles table, then create a codepage that uses it to display all vehicles"

3. **Ask for Help**: "What MCP tools can help me create a data entry form?"

4. **Iterate Quickly**: Use version control to save snapshots, then experiment freely knowing you can rollback

5. **Export and Share**: Export codepages as JSON to version control them in git

## 📚 More Help

- **Full Documentation**: [KIRO_SETUP.md](KIRO_SETUP.md)
- **Test Your Setup**: Run `node verify-mcp.js`
- **API Reference**: [CLAUDE.md](CLAUDE.md)
- **Examples**: [MyDealership.html](MyDealership.html)

## 🐛 Troubleshooting

**Agent can't connect to QuickBase?**
- Check `QB_USER_TOKEN` is exported: `echo $QB_USER_TOKEN`
- Restart Kiro.dev after setting environment variables

**Tools not showing up?**
- Reload MCP servers in Kiro.dev
- Check `.kiro/settings/mcp.json` syntax
- Verify build: `npm run build`

**Permission errors?**
- Use `quickbase_test_permissions` to check access
- Verify your user token has app access

## 🎉 You're Ready!

Your QuickBase MCP integration is fully configured. Start by asking Kiro.dev to list your tables, then explore from there!

**Happy coding!** 🚀
