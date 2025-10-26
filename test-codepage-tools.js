#!/usr/bin/env node

/**
 * Test Script for QuickBase Codepage MCP Tools
 *
 * This script tests the new codepage deployment, validation, and testing tools
 * added to the QuickBase MCP server.
 */

import { QuickBaseClient } from './dist/quickbase/client.js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  realm: process.env.QB_REALM || 'vibe.quickbase.com',
  userToken: process.env.QB_USER_TOKEN,
  appId: process.env.QB_APP_ID || 'bvhuaz7',
  timeout: 30000,
  maxRetries: 3
};

if (!config.userToken) {
  console.error('❌ QB_USER_TOKEN is required');
  process.exit(1);
}

const client = new QuickBaseClient(config);

console.log('🧪 QuickBase Codepage MCP Tools Test');
console.log('====================================\n');

async function testValidation() {
  console.log('1️⃣  Testing Codepage Validation');
  console.log('--------------------------------');

  // Read the hero library
  const heroCode = readFileSync('./quickbase_codepage_hero.js', 'utf-8');

  const result = client.validateCodepageCode(heroCode);

  console.log(`Valid: ${result.valid}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log(`Warnings: ${result.warnings.length}`);

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach(err => console.log(`  ❌ ${err}`));
  }

  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    result.warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
  }

  console.log('');
  return result.valid;
}

async function testDeployment() {
  console.log('2️⃣  Testing Deployment Instructions');
  console.log('-----------------------------------');

  const heroCode = readFileSync('./quickbase_codepage_hero.js', 'utf-8');

  const result = await client.deployToCodepage(
    config.appId,
    3,
    heroCode,
    'QuickBase Codepage Hero v2.2.0'
  );

  console.log(`Page ID: ${result.pageId}`);
  console.log(`URL: ${result.url}`);
  console.log(`Code Size: ${result.instructions.codeSize}`);
  console.log('\nDeployment Steps:');
  result.instructions.steps.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step}`);
  });

  console.log('');
  return result;
}

async function testLoadCodepage() {
  console.log('3️⃣  Testing Codepage Load (if deployed)');
  console.log('---------------------------------------');

  try {
    const result = await client.testLoadCodepage(config.appId, 3);

    console.log(`Success: ${result.success}`);

    if (result.success) {
      console.log(`Size: ${result.size} bytes (${Math.round(result.size / 1024)}KB)`);
      console.log(`Content Type: ${result.contentType}`);
      console.log(`Is JavaScript: ${result.isJavaScript}`);
      console.log('\nPreview:');
      console.log(result.preview);
    } else {
      console.log(`Error: ${result.error}`);
      console.log('(This is expected if codepage is not yet deployed)');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    console.log('(This may be expected if codepage requires authentication)');
  }

  console.log('');
}

async function testCodepageSave() {
  console.log('4️⃣  Testing Codepage Save Simulation');
  console.log('-------------------------------------');

  // Test data matching the pricing calculator table structure
  const testData = {
    7: { value: 35000 },   // MSRP
    8: { value: 2000 },    // Discount
    9: { value: 4.5 },     // Financing Rate
    10: { value: 15000 },  // Trade In Value
    11: { value: 33000 }   // Final Price
  };

  try {
    const result = await client.testCodepageSave('bvhuaz8wz', testData);

    console.log(`Success: ${result.success}`);

    if (result.success) {
      console.log(`Record ID: ${result.recordId}`);
      console.log(`Message: ${result.message}`);
      console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
    } else {
      console.log(`Error: ${result.error}`);
      if (result.details) {
        console.log('Details:', JSON.stringify(result.details, null, 2));
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }

  console.log('');
}

async function testMyDealershipDeployment() {
  console.log('5️⃣  Testing MyDealership Deployment');
  console.log('------------------------------------');

  const myDealershipCode = readFileSync('./MyDealership.html', 'utf-8');

  // Validate first
  const validation = client.validateCodepageCode(myDealershipCode);
  console.log(`Validation: ${validation.valid ? '✅ Valid' : '❌ Invalid'}`);

  if (!validation.valid) {
    console.log('Errors:');
    validation.errors.forEach(err => console.log(`  ❌ ${err}`));
  }

  // Get deployment instructions
  const deployment = await client.deployToCodepage(
    config.appId,
    2,
    myDealershipCode,
    'MyDealership - Pricing Calculator'
  );

  console.log(`\nDeploy to: ${deployment.url}`);
  console.log(`Code Size: ${deployment.instructions.codeSize}`);
  console.log('\nNote: ' + deployment.instructions.message);

  console.log('');
}

async function runAllTests() {
  console.log(`App ID: ${config.appId}`);
  console.log(`Realm: ${config.realm}\n`);

  try {
    await testValidation();
    await testDeployment();
    await testLoadCodepage();
    await testCodepageSave();
    await testMyDealershipDeployment();

    console.log('✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('   • Validation: Tests code syntax and best practices');
    console.log('   • Deployment: Provides manual deployment instructions');
    console.log('   • Load Test: Checks if codepage is accessible');
    console.log('   • Save Test: Simulates codepage save operations');
    console.log('\n💡 Next Steps:');
    console.log('   1. Manually deploy codepages using instructions above');
    console.log('   2. Test load to verify deployment');
    console.log('   3. Test save to verify data operations work');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runAllTests();
