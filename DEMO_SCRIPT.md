# QuickBase MCP Demo Script

**For**: QuickBase Team Presentation
**Duration**: 10-15 minutes
**Goal**: Demonstrate AI-powered QuickBase development with MCP

---

## Setup Checklist (Before Demo)

- [ ] MCP server built: `npm run build`
- [ ] Environment configured: QB_REALM, QB_USER_TOKEN, QB_APP_ID set
- [ ] Kiro.dev or Claude Desktop restarted
- [ ] Test connection: `node verify-mcp.js`
- [ ] Have browser ready for QuickBase UI

---

## Demo Flow

### Part 1: Introduction (2 min)

**What is MCP?**
> "Model Context Protocol allows AI agents to interact with external systems. We've built an MCP server that gives AI agents full access to QuickBase's API - creating a powerful AI-assisted development experience."

**What We'll Show:**
1. AI agent exploring QuickBase app structure
2. Generating code automatically from schema
3. Building a complete codepage with AI assistance
4. Version control and lifecycle management

---

### Part 2: Basic QuickBase Operations (3 min)

#### Demo 2.1: Explore App Structure

**Say to Agent:**
```
"Show me all tables in my QuickBase app and describe what you find"
```

**Expected Output:**
- Agent lists all tables
- Shows field counts
- Identifies relationships

**Key Point:** *"The AI understands our QuickBase schema automatically"*

---

#### Demo 2.2: Generate Field Mapping

**Say to Agent:**
```
"Generate a JavaScript field map for table [YOUR_TABLE_ID]"
```

**Expected Output:**
```javascript
const FIELDS = {
  RELATED_VEHICLE: 6,
  MSRP: 7,
  DISCOUNT: 8,
  // ... etc
};
```

**Key Point:** *"No more looking up field IDs manually - AI generates them instantly"*

---

### Part 3: AI-Powered Codepage Development (5 min)

#### Demo 3.1: Create Complete Codepage

**Say to Agent:**
```
"Create a codepage that:
1. Loads all records from table [TABLE_ID]
2. Displays them in a sortable, filterable table
3. Has a form to add new records
4. Uses Material Design styling
5. Includes proper error handling
6. Uses session authentication"
```

**Expected Output:**
- Complete HTML/JavaScript codepage
- Uses QuickBase Codepage Hero for session auth
- Professional UI with Material Design
- Proper field mapping
- Error handling

**Key Point:** *"In seconds, we have a production-ready codepage that would take hours to write manually"*

---

#### Demo 3.2: Save to QuickBase

**Say to Agent:**
```
"Save this codepage to table [CODEPAGE_TABLE] with name 'Vehicle Manager' and tag it as 'production'"
```

**Expected Output:**
- Codepage saved
- Returns record ID
- Ready to deploy

---

### Part 4: Version Control & Lifecycle (3 min)

#### Demo 4.1: Save Version

**Say to Agent:**
```
"Save this codepage as version 1.0.0 with note 'Initial production release'"
```

**Key Point:** *"Built-in version control - never lose working code"*

---

#### Demo 4.2: Clone and Modify

**Say to Agent:**
```
"Clone this codepage for table [DIFFERENT_TABLE] and adapt the field mappings"
```

**Expected Output:**
- Cloned codepage
- Field IDs automatically updated
- New record ID

**Key Point:** *"Reuse proven patterns across different tables instantly"*

---

#### Demo 4.3: Export for Documentation

**Say to Agent:**
```
"Export this codepage as markdown documentation"
```

**Expected Output:**
```markdown
# Vehicle Manager

Complete vehicle management interface...

## Code
```javascript
// Full code here
```
```

**Key Point:** *"Automatic documentation generation for team sharing"*

---

### Part 5: Advanced Features (2 min)

#### Demo 5.1: Search Codepages

**Say to Agent:**
```
"Find all codepages tagged 'production' for the vehicles table"
```

**Key Point:** *"Organize and find codepages easily as your library grows"*

---

#### Demo 5.2: Rollback

**Say to Agent:**
```
"Show me version history for this codepage, then rollback to version 1.0.0"
```

**Key Point:** *"Safe experimentation - always roll back if needed"*

---

## Key Statistics to Mention

- **47 Total MCP Tools** - Comprehensive QuickBase API coverage
- **8 New Codepage Tools** - Complete lifecycle management
- **Zero Manual Token Management** - Session authentication
- **Multi-Agent Support** - Works with Kiro.dev, Claude Desktop, VS Code
- **Type-Safe** - Full TypeScript implementation
- **Production Ready** - Error handling, retries, logging

---

## Common Questions & Answers

### Q: "Does this work with our existing QuickBase apps?"
**A:** Yes! It's a standard REST API client. Works with any QuickBase app you have access to.

### Q: "How does authentication work?"
**A:** Two approaches:
1. **Development**: User tokens via MCP server
2. **Production Codepages**: Session authentication (no tokens needed)

### Q: "Can we deploy these codepages to QuickBase?"
**A:** Yes! The MCP gives deployment instructions, then you paste the code into QuickBase's built-in codepage editor.

### Q: "What about security?"
**A:**
- Uses standard QuickBase authentication
- Respects all user permissions
- No privilege escalation
- Session auth in codepages (industry best practice)

### Q: "How does this compare to manual development?"
**A:**
- **Manual**: 2-3 hours for a basic CRUD codepage
- **With MCP**: 2-3 minutes, including field mapping and styling

### Q: "Can we version control the codepages?"
**A:** Yes! Built-in version snapshots, plus you can export to git.

### Q: "What if we make a mistake?"
**A:** Rollback to any previous version instantly.

---

## Demo Tips

### Do's:
- ✅ Start with simple operations, build to complex
- ✅ Show the generated code - let them see the quality
- ✅ Emphasize time savings (hours → minutes)
- ✅ Highlight version control for safety
- ✅ Show both exploration and creation workflows

### Don'ts:
- ❌ Don't skip the setup verification
- ❌ Don't assume they know what MCP is
- ❌ Don't rush through the codepage generation
- ❌ Don't forget to show the actual QuickBase UI

---

## Backup Demos (If Time Allows)

### Relationship Management
```
"Create a one-to-many relationship between Vehicles and Pricing tables with automatic lookup fields"
```

### Bulk Operations
```
"Create 10 test records in the vehicles table with realistic data"
```

### Schema Exploration
```
"Explain the relationship between all tables in this app and visualize the data model"
```

---

## Post-Demo Resources

Hand out:
1. **[QUICK_START.md](QUICK_START.md)** - Get started guide
2. **[MCP_SETUP_ALL_AGENTS.md](MCP_SETUP_ALL_AGENTS.md)** - Multi-agent setup
3. **GitHub Repository**: https://github.com/BLTCPT/QuickBase-MCP-Server
4. **Live Example**: MyDealership.html

---

## Troubleshooting (Just in Case)

### Agent Can't Connect
```bash
# Quick fix
npm run build
node verify-mcp.js
# Restart agent
```

### Permission Errors
```bash
# Test permissions
node -e "import('./dist/quickbase/client.js').then(m => {
  const c = new m.QuickBaseClient({...config});
  c.testConnection().then(r => console.log('Connected:', r));
})"
```

### Wrong Table ID
- Have the QuickBase UI open
- Can quickly grab correct table ID from URL

---

## Success Metrics

By the end of the demo, they should understand:
- ✅ MCP enables AI-powered QuickBase development
- ✅ Dramatically reduces development time
- ✅ Provides version control and safety
- ✅ Works with existing QuickBase infrastructure
- ✅ Production-ready with proper authentication

---

## Follow-Up Actions

After positive reception:
1. Share GitHub repository access
2. Schedule technical deep-dive if interested
3. Offer to help with pilot implementation
4. Provide access to test MCP server

---

**Good luck with the demo!** 🚀

*Remember: Show, don't tell. Let the AI do the talking by demonstrating real capabilities.*
