#!/bin/bash

# Test script to verify QuickBase MCP server works with Kiro.dev
# This simulates what Kiro.dev does when calling the MCP server

set -e

echo "🧪 Testing QuickBase MCP Server for Kiro.dev"
echo "=============================================="
echo ""

# Check environment
echo "1. Checking environment..."
if [ -z "$QB_USER_TOKEN" ]; then
    echo "⚠️  Warning: QB_USER_TOKEN not set in environment"
    echo "   Using token from test config"
    export QB_USER_TOKEN="b3tqay_rwcp_0_v89whgdnnhm4ec9uz5k9bvi268a"
fi
echo "   ✓ QB_USER_TOKEN is set"
echo ""

# Check build
echo "2. Checking build..."
if [ ! -f "dist/index.js" ]; then
    echo "   ❌ dist/index.js not found. Running build..."
    npm run build
fi
echo "   ✓ Build exists"
echo ""

# Set environment variables
export QB_REALM="vibe.quickbase.com"
export QB_APP_ID="bvhuaz7"

echo "3. Testing MCP server startup..."
echo "   Starting server with test input..."
echo ""

# Create a test MCP request (list tools)
cat > /tmp/mcp-test-request.json << 'EOF'
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
EOF

# Test the server
timeout 5s node dist/index.js < /tmp/mcp-test-request.json > /tmp/mcp-test-response.json 2>&1 || true

# Check if we got a response
if [ -f /tmp/mcp-test-response.json ]; then
    echo "4. Checking response..."
    if grep -q "quickbase" /tmp/mcp-test-response.json; then
        echo "   ✓ MCP server responded correctly"
        echo ""
        echo "5. Available tools:"
        cat /tmp/mcp-test-response.json | grep -o '"name":"[^"]*"' | head -10 | sed 's/"name":"//g' | sed 's/"//g' | awk '{print "   - " $0}'
        echo "   ... and more"
        echo ""
        echo "✅ MCP Server is ready for Kiro.dev!"
        echo ""
        echo "Next steps:"
        echo "1. Make sure QB_USER_TOKEN is exported in your shell profile"
        echo "2. Restart Kiro.dev or reload MCP servers"
        echo "3. Try asking: 'List all tables in my QuickBase app using MCP'"
    else
        echo "   ❌ Unexpected response format"
        cat /tmp/mcp-test-response.json
    fi
else
    echo "   ❌ No response from server"
    echo "   Check the server logs above for errors"
fi

echo ""
echo "Configuration file: .kiro/settings/mcp.json"
echo "Documentation: KIRO_SETUP.md"

# Cleanup
rm -f /tmp/mcp-test-request.json /tmp/mcp-test-response.json
