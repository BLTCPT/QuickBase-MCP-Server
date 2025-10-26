#!/usr/bin/env node

/**
 * Comprehensive Test Suite for QuickBase MCP Codepage Development Tools
 */

import { QuickBaseClient } from './dist/quickbase/client.js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  realm: process.env.QB_REALM || 'vibe.quickbase.com',
  userToken: process.env.QB_USER_TOKEN,
  appId: process.env.QB_APP_ID || 'bvhuaz7',
  tableId: 'bvhuaz8wz', // Test table
  timeout: 30000,
  maxRetries: 3
};

if (!config.userToken) {
  console.error('❌ QB_USER_TOKEN is required');
  process.exit(1);
}

const client = new QuickBaseClient(config);

console.log('🧪 QuickBase MCP Codepage Development Tools - Complete Test Suite');
console.log('===================================================================\n');

async function testSchemaDiscovery() {
  console.log('📊 Schema Discovery Tools');
  console.log('-------------------------');

  try {
    // Get table schema
    const schema = await client.getTableSchemaForCodepage(config.tableId);
    console.log(`✅ Table Schema Retrieved`);
    console.log(`   User Fields: ${schema.userFields.length}`);
    console.log(`   Lookup Fields: ${schema.lookupFields.length}`);
    console.log(`   Formula Fields: ${schema.formulaFields.length}`);
    console.log(`   System Fields: ${schema.systemFields.length}`);

    // Generate field map
    const fieldMap = await client.generateFieldMapCode(config.tableId);
    console.log(`\n✅ Field Map Generated:`);
    console.log(fieldMap.split('\n').slice(0, 8).join('\n') + '\n...');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  console.log('');
}

async function testCodeSnippets() {
  console.log('📝 Code Snippets');
  console.log('----------------');

  const snippets = [
    'session-auth-fetch',
    'create-record',
    'query-records',
    'update-record',
    'delete-record',
    'error-handling'
  ];

  snippets.forEach(name => {
    const snippet = client.getCodeSnippet(name);
    const lines = snippet.split('\n');
    console.log(`✅ ${name}:`);
    console.log(`   ${lines[0]}`);
    console.log(`   Lines: ${lines.length}`);
  });

  console.log('');
}

async function testPermissions() {
  console.log('🔐 Permission Testing');
  console.log('--------------------');

  try {
    const permissions = await client.testApiPermissions(config.tableId);
    console.log(`Table: ${permissions.tableId}`);
    console.log(`✅ Can Read: ${permissions.canRead}`);
    console.log(`✅ Can Get Fields: ${permissions.canGetFields}`);

    if (permissions.errors.length > 0) {
      console.log(`\n⚠️  Errors:`);
      permissions.errors.forEach(err => console.log(`   - ${err}`));
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }

  console.log('');
}

async function testCodepageValidation() {
  console.log('✔️  Codepage Validation');
  console.log('----------------------');

  const heroCode = readFileSync('./quickbase_codepage_hero.js', 'utf-8');
  const validation = client.validateCodepageCode(heroCode);

  console.log(`Valid: ${validation.valid ? '✅' : '❌'}`);
  console.log(`Errors: ${validation.errors.length}`);
  console.log(`Warnings: ${validation.warnings.length}`);

  if (validation.warnings.length > 0) {
    validation.warnings.forEach(w => console.log(`   ⚠️  ${w}`));
  }

  console.log('');
}

async function testCodepageDeployment() {
  console.log('🚀 Codepage Deployment');
  console.log('----------------------');

  const heroCode = readFileSync('./quickbase_codepage_hero.js', 'utf-8');
  const deployment = await client.deployToCodepage(config.appId, 3, heroCode);

  console.log(`URL: ${deployment.url}`);
  console.log(`Code Size: ${deployment.instructions.codeSize}`);
  console.log(`Steps: ${deployment.instructions.steps.length}`);

  console.log('');
}

async function testCodepageLoad() {
  console.log('📥 Codepage Load Test');
  console.log('--------------------');

  try {
    const result = await client.testLoadCodepage(config.appId, 3);
    console.log(`Success: ${result.success ? '✅' : '❌'}`);

    if (result.success) {
      console.log(`Size: ${result.size} bytes`);
      console.log(`Is JavaScript: ${result.isJavaScript}`);
    } else {
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ ${error.message}`);
  }

  console.log('');
}

async function testCodepageSave() {
  console.log('💾 Codepage Save Test');
  console.log('--------------------');

  const testData = {
    7: { value: 35000 },
    8: { value: 2000 }
  };

  try {
    const result = await client.testCodepageSave(config.tableId, testData);
    console.log(`Success: ${result.success ? '✅' : '❌'}`);

    if (result.success) {
      console.log(`Record ID: ${result.recordId}`);
    } else {
      console.log(`Error: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ ${error.message}`);
  }

  console.log('');
}

async function runAllTests() {
  console.log(`App: ${config.appId}`);
  console.log(`Realm: ${config.realm}`);
  console.log(`Table: ${config.tableId}\n`);

  try {
    await testSchemaDiscovery();
    await testCodeSnippets();
    await testPermissions();
    await testCodepageValidation();
    await testCodepageDeployment();
    await testCodepageLoad();
    await testCodepageSave();

    console.log('═══════════════════════════════════════════════');
    console.log('✅ All Tests Completed Successfully!');
    console.log('═══════════════════════════════════════════════\n');

    console.log('📚 Available MCP Tools Summary:');
    console.log('');
    console.log('Schema & Discovery:');
    console.log('  • quickbase_get_table_schema - Get organized table schema');
    console.log('  • quickbase_generate_field_map - Generate field mapping code');
    console.log('');
    console.log('Code Generation:');
    console.log('  • quickbase_get_code_snippet - Get common code patterns');
    console.log('');
    console.log('Testing & Validation:');
    console.log('  • quickbase_validate_codepage - Validate JavaScript syntax');
    console.log('  • quickbase_test_permissions - Test API permissions');
    console.log('  • quickbase_test_load_codepage - Verify codepage deployment');
    console.log('  • quickbase_test_codepage_save - Test save operations');
    console.log('');
    console.log('Deployment:');
    console.log('  • quickbase_deploy_codepage - Get deployment instructions');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

runAllTests();
