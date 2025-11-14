#!/usr/bin/env node

/**
 * Verify QuickBase MCP Server is working for Kiro.dev
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Verifying QuickBase MCP Server for Kiro.dev\n');

// Set environment
process.env.QB_REALM = 'vibe.quickbase.com';
process.env.QB_USER_TOKEN = process.env.QB_USER_TOKEN || 'b3tqay_rwcp_0_v89whgdnnhm4ec9uz5k9bvi268a';
process.env.QB_APP_ID = 'bvhuaz7';

console.log('Environment:');
console.log(`  QB_REALM: ${process.env.QB_REALM}`);
console.log(`  QB_APP_ID: ${process.env.QB_APP_ID}`);
console.log(`  QB_USER_TOKEN: ${process.env.QB_USER_TOKEN ? '***set***' : 'NOT SET'}\n`);

// Start MCP server
const serverPath = join(__dirname, 'dist', 'index.js');
console.log(`Starting MCP server: ${serverPath}\n`);

const server = spawn('node', [serverPath], {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

// Send list tools request
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list'
};

console.log('Sending tools/list request...\n');

// Write request
server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

// Wait for response
setTimeout(() => {
  server.kill();

  console.log('Server stderr output:');
  console.log(errorOutput);
  console.log('\nServer stdout output:');

  if (output.trim()) {
    try {
      const lines = output.trim().split('\n');
      const response = JSON.parse(lines[lines.length - 1]);

      if (response.result && response.result.tools) {
        console.log(`✅ MCP Server working! Found ${response.result.tools.length} tools\n`);

        console.log('New codepage management tools:');
        const newTools = response.result.tools.filter(t =>
          t.name.includes('update_codepage') ||
          t.name.includes('search_codepages') ||
          t.name.includes('clone_codepage') ||
          t.name.includes('export_codepage') ||
          t.name.includes('import_codepage') ||
          t.name.includes('version') ||
          t.name.includes('rollback')
        );

        newTools.forEach(tool => {
          console.log(`  ✓ ${tool.name}: ${tool.description}`);
        });

        console.log('\n📋 Configuration Summary:');
        console.log('  Config file: .kiro/settings/mcp.json');
        console.log('  Server path: ' + serverPath);
        console.log('  App ID: bvhuaz7');
        console.log(`  Auto-approved tools: Read-only operations`);

        console.log('\n🚀 Next Steps:');
        console.log('  1. Restart Kiro.dev or reload MCP servers');
        console.log('  2. Try: "List all tables in my QuickBase app"');
        console.log('  3. Try: "Generate a field map for table bvhuaz8wz"');
        console.log('  4. See KIRO_SETUP.md for more examples');

      } else {
        console.log('❌ Unexpected response format:');
        console.log(JSON.stringify(response, null, 2));
      }
    } catch (e) {
      console.log('❌ Failed to parse response:');
      console.log(output);
      console.log('\nError:', e.message);
    }
  } else {
    console.log('❌ No output received from server');
  }

  process.exit(0);
}, 3000);
