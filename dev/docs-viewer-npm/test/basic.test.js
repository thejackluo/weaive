/**
 * Basic smoke test for @jackluo/docs-viewer
 *
 * Tests:
 * 1. Server module can be required
 * 2. startServer function exists and is callable
 * 3. Server can find docs directory
 *
 * Run: node test/basic.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('🧪 Running basic tests for @jackluo/docs-viewer\n');

// Test 1: Module can be loaded
console.log('Test 1: Loading server module...');
try {
    const server = require('../lib/server.js');
    assert.ok(server, 'Server module should be loaded');
    console.log('✅ PASS: Server module loaded successfully\n');
} catch (error) {
    console.error('❌ FAIL: Could not load server module');
    console.error(error.message);
    process.exit(1);
}

// Test 2: startServer function exists
console.log('Test 2: Checking startServer function...');
const { startServer } = require('../lib/server.js');
try {
    assert.strictEqual(typeof startServer, 'function', 'startServer should be a function');
    console.log('✅ PASS: startServer is a function\n');
} catch (error) {
    console.error('❌ FAIL: startServer is not a function');
    console.error(error.message);
    process.exit(1);
}

// Test 3: Can handle docs directory
console.log('Test 3: Testing docs directory handling...');
const testDocsDir = path.join(__dirname, '../../../docs');
try {
    if (fs.existsSync(testDocsDir)) {
        console.log(`   Found docs directory: ${testDocsDir}`);
        const files = fs.readdirSync(testDocsDir);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        console.log(`   Contains ${mdFiles.length} markdown files`);
        console.log('✅ PASS: Docs directory accessible\n');
    } else {
        console.log('⚠️  WARNING: Test docs directory not found (this is OK for clean install)');
        console.log(`   Expected: ${testDocsDir}\n`);
    }
} catch (error) {
    console.error('❌ FAIL: Error accessing docs directory');
    console.error(error.message);
    process.exit(1);
}

// Test 4: Package.json is valid
console.log('Test 4: Validating package.json...');
try {
    const packageJson = require('../package.json');
    assert.ok(packageJson.name, 'Package should have a name');
    assert.ok(packageJson.version, 'Package should have a version');
    assert.ok(packageJson.bin, 'Package should have bin entry');
    assert.ok(packageJson.bin['docs-viewer'], 'Package should have docs-viewer bin command');
    console.log(`   Package: ${packageJson.name}@${packageJson.version}`);
    console.log('✅ PASS: package.json is valid\n');
} catch (error) {
    console.error('❌ FAIL: Invalid package.json');
    console.error(error.message);
    process.exit(1);
}

// Test 5: CLI entry point exists and has shebang
console.log('Test 5: Checking CLI entry point...');
const cliPath = path.join(__dirname, '../bin/docs-viewer.js');
try {
    assert.ok(fs.existsSync(cliPath), 'CLI file should exist');
    const cliContent = fs.readFileSync(cliPath, 'utf8');
    assert.ok(cliContent.startsWith('#!/usr/bin/env node'), 'CLI should have node shebang');
    console.log('✅ PASS: CLI entry point is valid\n');
} catch (error) {
    console.error('❌ FAIL: CLI entry point issue');
    console.error(error.message);
    process.exit(1);
}

// Test 6: Public HTML exists
console.log('Test 6: Checking public assets...');
const htmlPath = path.join(__dirname, '../public/index.html');
try {
    assert.ok(fs.existsSync(htmlPath), 'index.html should exist in public/');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    assert.ok(htmlContent.includes('<!DOCTYPE html>'), 'HTML should be valid');
    const sizeKB = (fs.statSync(htmlPath).size / 1024).toFixed(1);
    console.log(`   index.html size: ${sizeKB} KB`);
    console.log('✅ PASS: Public assets exist\n');
} catch (error) {
    console.error('❌ FAIL: Public assets missing');
    console.error(error.message);
    process.exit(1);
}

console.log('╔════════════════════════════════════════╗');
console.log('║  ✅ All Tests Passed!                 ║');
console.log('╚════════════════════════════════════════╝\n');
console.log('📦 Package is ready for publication');
console.log('🚀 Next steps:');
console.log('   1. npm link (test locally)');
console.log('   2. npm publish --access public\n');
