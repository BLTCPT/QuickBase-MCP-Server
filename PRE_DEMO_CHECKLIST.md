# Pre-Demo Checklist for QuickBase Team

## ✅ 5 Minutes Before Demo

### 1. Verify MCP Server
```bash
cd /Users/mark2/Documents/QB-MCP/QuickBase-MCP-Server
node verify-mcp.js
```
**Expected**: `✅ MCP Server working! Found 47 tools`

---

### 2. Test Agent Connection

**For Kiro.dev:**
```
Open Kiro.dev → New conversation
Type: "List all tables in my QuickBase app"
```

**For Claude Desktop:**
```
Open Claude Desktop → Look for MCP tools icon (🔨)
Type: "What QuickBase MCP tools do you have?"
```

**Expected**: Agent responds with table list or tool list

---

### 3. Prepare QuickBase UI

- [ ] Open https://vibe.quickbase.com in browser
- [ ] Login and navigate to app `bvhuaz7`
- [ ] Have one table open (e.g., Pricing table)
- [ ] Know the table ID for quick reference

---

### 4. Have Example Prompts Ready

Copy these to a text file for quick access:

```
1. "Show me all tables in my QuickBase app and their relationships"

2. "Generate a JavaScript field map for table bvhuaz8wz"

3. "Create a codepage that loads all records from table bvhuaz8wz, displays them in a sortable table, and includes a form to add new records. Use Material Design styling."

4. "Save this codepage with name 'Pricing Manager' and tag it as 'demo'"

5. "Save this as version 1.0.0"

6. "Clone this codepage for a different table"

7. "Export this codepage as markdown"
```

---

### 5. Verify Files Are Ready

- [ ] [DEMO_SCRIPT.md](DEMO_SCRIPT.md) - Open and review
- [ ] [QUICK_START.md](QUICK_START.md) - Have ready to share
- [ ] [MCP_SETUP_ALL_AGENTS.md](MCP_SETUP_ALL_AGENTS.md) - For technical questions
- [ ] [MyDealership.html](MyDealership.html) - Live example

---

### 6. Check Environment

```bash
echo $QB_USER_TOKEN  # Should show token
echo $QB_REALM       # Should show vibe.quickbase.com
echo $QB_APP_ID      # Should show bvhuaz7
```

If any are missing:
```bash
export QB_USER_TOKEN="b3tqay_rwcp_0_v89whgdnnhm4ec9uz5k9bvi268a"
export QB_REALM="vibe.quickbase.com"
export QB_APP_ID="bvhuaz7"
```

---

### 7. Test a Quick Operation

```
Agent: "Get the first 3 records from table bvhuaz8wz"
```

**Expected**: Returns record data successfully

---

## 🎯 Demo Goals

- [ ] Show AI understands QuickBase schema
- [ ] Demonstrate codepage generation in minutes vs hours
- [ ] Highlight version control and safety
- [ ] Show multi-format export capabilities
- [ ] Prove production-ready code quality

---

## 🔧 Emergency Fixes

### If MCP Server Won't Start
```bash
npm run build
pkill -f "node.*dist/index.js"
node verify-mcp.js
```

### If Agent Can't See Tools
1. Restart the agent completely
2. Check config file: `.kiro/settings/mcp.json`
3. Verify `dist/index.js` exists

### If QuickBase Returns 403
```bash
# Test connection directly
node -e "
import('./dist/quickbase/client.js').then(async ({ QuickBaseClient }) => {
  const client = new QuickBaseClient({
    realm: 'vibe.quickbase.com',
    userToken: 'b3tqay_rwcp_0_v89whgdnnhm4ec9uz5k9bvi268a',
    appId: 'bvhuaz7'
  });
  const result = await client.testConnection();
  console.log('Connected:', result);
});
"
```

---

## 📊 Key Stats to Mention

- **47 MCP Tools** - Complete QuickBase API coverage
- **8 New Tools** - Codepage lifecycle management
- **2-3 minutes** - Time to generate production codepage
- **Zero tokens** - Session authentication in codepages
- **Full TypeScript** - Type-safe implementation

---

## 🎬 Demo Stages

1. **Introduction** (2 min) - What is MCP, what we'll show
2. **Basic Operations** (3 min) - Explore schema, generate field maps
3. **Codepage Development** (5 min) - Create, save, deploy
4. **Lifecycle Management** (3 min) - Version, clone, export
5. **Q&A** (2-5 min) - Questions and discussion

---

## 💡 Pro Tips

1. **Show, Don't Tell**: Let the AI generate code on screen
2. **Pause After Each Step**: Let them see the quality
3. **Have Browser Ready**: Show QuickBase UI alongside
4. **Prepare for Questions**: Review Q&A in DEMO_SCRIPT.md
5. **Emphasize Safety**: Version control = safe experimentation

---

## 📱 Backup Plan

If live demo has issues:
1. Have screenshots of successful operations
2. Show pre-generated codepage from MyDealership.html
3. Walk through code manually
4. Offer follow-up live demo

---

## ✅ Final Check (Right Before Demo)

- [ ] Agent is running and responsive
- [ ] Browser open to QuickBase
- [ ] Demo script visible on screen
- [ ] Example prompts copied to clipboard
- [ ] Confident and ready!

---

## 🎤 Opening Line

> "Today I'm going to show you how AI can transform QuickBase development. We've built an MCP server that gives AI agents full access to QuickBase's API. Watch how we can build a complete, production-ready codepage in under 3 minutes - something that would normally take hours."

---

## 🎬 Closing Line

> "This is production-ready today. The code is open source on GitHub, fully documented, and works with multiple AI agents. We've reduced codepage development time from hours to minutes, with built-in version control and safety. Who's ready to try it?"

---

**You've got this!** 🚀

*Everything is tested, documented, and ready to impress.*
