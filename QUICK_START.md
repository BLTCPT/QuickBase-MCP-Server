# 🚀 Quick Start Guide

## Test Right Now (30 seconds)

```bash
# 1. Set your token
export QB_USER_TOKEN="your_quickbase_token"

# 2. Run verification
node verify-mcp-connection.js
```

That's it! If you see ✅ symbols, everything works.

## Use from Kiro.dev

After Kiro restarts, just ask:

```
"List all tables in my QuickBase app"
```

## New Codepage Tools

| Tool | What It Does |
|------|--------------|
| `update_codepage` | Update code, version, description |
| `search_codepages` | Find by name, tags, or table |
| `clone_codepage` | Duplicate with changes |
| `export_codepage` | Get as HTML/JSON/Markdown |
| `save_codepage_version` | Create version snapshot |
| `get_codepage_versions` | View history |
| `rollback_codepage` | Restore previous version |
| `import_codepage` | Import from file |

## Common Commands

### From Terminal
```bash
# Quick test
node verify-mcp-connection.js

# Full test suite
node test-mcp-direct.js

# Easy runner
./quick-test.sh
```

### From Kiro
```
"Generate a field map for table bvhuaz8wz"
"List all codepages"
"Search for codepages with 'pricing' in the name"
"Clone codepage 123 as 'New Calculator'"
"Export codepage 456 as JSON"
"Save version 1.0.0 of codepage 789"
```

## Configuration

- **Realm**: vibe.quickbase.com
- **App ID**: bvhuaz7
- **Config**: `.kiro/settings/mcp.json`
- **Env**: `.env`

## Need Help?

- **Full docs**: See `AGENTS.md`
- **What changed**: See `UPDATE_SUMMARY.md`
- **Detailed guide**: See `READY_TO_TEST.md`

## Status

✅ Built and ready
✅ 47 tools available
✅ 8 new codepage tools
✅ Auto-approved read operations
✅ Test scripts created

Just set `QB_USER_TOKEN` and go! 🎉
