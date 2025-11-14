#!/usr/bin/env node

/**
 * Test script for new QuickBase MCP codepage tools
 * Tests: update, search, clone, export, import, version control
 */

import { QuickBaseClient } from './dist/quickbase/client.js';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  realm: process.env.QB_REALM || '',
  userToken: process.env.QB_USER_TOKEN || '',
  appId: process.env.QB_APP_ID || '',
  timeout: 30000,
  maxRetries: 3
};

const CODEPAGE_TABLE_ID = process.env.QB_CODEPAGE_TABLE_ID || 'bvhuaz8wz';

async function testNewCodepageTools() {
  console.log('\n=== Testing New QuickBase MCP Codepage Tools ===\n');

  const client = new QuickBaseClient(config);

  try {
    // Test 1: List existing codepages (query with Record ID field included)
    console.log('1. Testing list codepages...');
    const codepages = await client.getRecords(CODEPAGE_TABLE_ID, {
      select: [3, 6, 7, 8], // Include Record ID field
      top: 5
    });
    console.log(`   ✓ Found ${codepages.length} records`);

    if (codepages.length === 0) {
      console.log('   ! No codepages found, creating a test codepage...');
      const testCode = `// Test Codepage
function hello() {
  console.log('Hello from QuickBase!');
}`;
      const recordId = await client.saveCodepage(
        CODEPAGE_TABLE_ID,
        'Test Codepage',
        testCode,
        'A simple test codepage'
      );
      console.log(`   ✓ Created test codepage with ID: ${recordId}`);
      codepages.push({ '3': { value: recordId } });
    }

    // Get record ID from the first codepage
    const firstCodepage = codepages[0];
    const testRecordId = firstCodepage['3']?.value || firstCodepage[3]?.value;

    if (!testRecordId) {
      console.error('   ❌ Could not find record ID in codepage:', JSON.stringify(firstCodepage, null, 2));
      throw new Error('No valid record ID found');
    }
    console.log(`   Using record ID: ${testRecordId} for tests\n`);

    // Test 2: Update codepage
    console.log('2. Testing update codepage...');
    await client.updateCodepage(CODEPAGE_TABLE_ID, testRecordId, {
      description: 'Updated via MCP test',
      version: '1.0.0'
    });
    console.log('   ✓ Codepage updated successfully\n');

    // Test 3: Search codepages
    console.log('3. Testing search codepages...');
    const searchResults = await client.searchCodepages(CODEPAGE_TABLE_ID, {
      name: 'Test',
      limit: 10
    });
    console.log(`   ✓ Search found ${searchResults.length} codepages\n`);

    // Test 4: Clone codepage
    console.log('4. Testing clone codepage...');
    const clonedId = await client.cloneCodepage(
      CODEPAGE_TABLE_ID,
      testRecordId,
      'Cloned Test Codepage'
    );
    console.log(`   ✓ Cloned codepage with new ID: ${clonedId}\n`);

    // Test 5: Export codepage (JSON)
    console.log('5. Testing export codepage (JSON)...');
    const exportedJson = await client.exportCodepage(
      CODEPAGE_TABLE_ID,
      testRecordId,
      'json'
    );
    console.log(`   ✓ Exported as JSON (${exportedJson.length} bytes)`);
    console.log(`   Preview: ${exportedJson.substring(0, 100)}...\n`);

    // Test 6: Export codepage (Markdown)
    console.log('6. Testing export codepage (Markdown)...');
    const exportedMd = await client.exportCodepage(
      CODEPAGE_TABLE_ID,
      testRecordId,
      'markdown'
    );
    console.log(`   ✓ Exported as Markdown (${exportedMd.length} bytes)`);
    console.log(`   Preview:\n${exportedMd.split('\n').slice(0, 5).join('\n')}\n`);

    // Test 7: Save version
    console.log('7. Testing save version...');
    const versionId = await client.saveCodepageVersion(
      CODEPAGE_TABLE_ID,
      testRecordId,
      '1.0.0',
      'Initial version for testing'
    );
    console.log(`   ✓ Version saved with ID: ${versionId}\n`);

    // Test 8: Get version history
    console.log('8. Testing get version history...');
    const versions = await client.getCodepageVersions(
      CODEPAGE_TABLE_ID,
      testRecordId,
      10
    );
    console.log(`   ✓ Found ${versions.length} versions\n`);

    // Test 9: Validate codepage
    console.log('9. Testing validate codepage...');
    const testCode = `function test() { return "valid"; }`;
    const validation = client.validateCodepageCode(testCode);
    console.log(`   ✓ Validation result: ${validation.valid ? 'VALID' : 'INVALID'}`);
    if (validation.warnings.length > 0) {
      console.log(`   Warnings: ${validation.warnings.join(', ')}`);
    }
    console.log();

    // Test 10: Generate field map
    console.log('10. Testing generate field map...');
    const fieldMap = await client.generateFieldMapCode(CODEPAGE_TABLE_ID);
    console.log(`   ✓ Generated field map (${fieldMap.length} bytes)`);
    console.log(`   Preview:\n${fieldMap.split('\n').slice(0, 8).join('\n')}\n`);

    console.log('\n=== All Tests Passed! ===\n');

    // Summary
    console.log('Summary of New MCP Tools:');
    console.log('  ✓ quickbase_update_codepage');
    console.log('  ✓ quickbase_search_codepages');
    console.log('  ✓ quickbase_clone_codepage');
    console.log('  ✓ quickbase_export_codepage (JSON, Markdown, HTML)');
    console.log('  ✓ quickbase_save_codepage_version');
    console.log('  ✓ quickbase_get_codepage_versions');
    console.log('  ✓ quickbase_validate_codepage');
    console.log('  ✓ quickbase_generate_field_map');
    console.log();

    // Cleanup (delete cloned codepage)
    console.log('Cleanup: Deleting cloned codepage...');
    await client.deleteRecord(CODEPAGE_TABLE_ID, clonedId);
    console.log('✓ Cleanup complete\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testNewCodepageTools().catch(console.error);
