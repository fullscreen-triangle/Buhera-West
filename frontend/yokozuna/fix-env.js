#!/usr/bin/env node

console.log('🔧 Environment Variable Fix Script');
console.log('==================================');

// Check if .env.local exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('📍 Expected location:', envPath);
  process.exit(1);
}

console.log('✅ .env.local file exists');

// Read and parse the file
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('\n📄 Raw file content (first 200 chars):');
console.log(envContent.substring(0, 200) + '...');

// Check for common formatting issues
const lines = envContent.split('\n');
const issues = [];
const vars = {};

lines.forEach((line, index) => {
  const lineNum = index + 1;
  const trimmed = line.trim();
  
  if (trimmed === '' || trimmed.startsWith('#')) return;
  
  // Check for spaces around =
  if (trimmed.includes(' = ')) {
    issues.push(`Line ${lineNum}: Spaces around = (should be KEY=value)`);
  }
  
  // Check for quotes around values
  if (trimmed.match(/=["'].*["']$/)) {
    issues.push(`Line ${lineNum}: Quotes around value (remove quotes)`);
  }
  
  // Extract key-value pairs
  const match = trimmed.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    vars[key] = value;
  }
});

console.log('\n🔍 Found environment variables:');
Object.keys(vars).forEach(key => {
  if (key.toLowerCase().includes('weather') || key.toLowerCase().includes('mapbox')) {
    const value = vars[key];
    const preview = value.length > 10 ? value.substring(0, 10) + '...' : value;
    console.log(`  ${key}: ${preview}`);
  }
});

if (issues.length > 0) {
  console.log('\n❌ Formatting issues found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
  
  console.log('\n💡 Correct format should be:');
  console.log('NEXT_PUBLIC_OPENWEATHER_API_KEY=your_actual_key_here');
  console.log('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_actual_token_here');
  console.log('\n📝 No spaces around =, no quotes around values');
} else {
  console.log('\n✅ File format looks correct');
}

// Test environment loading
console.log('\n🧪 Testing environment loading:');
delete require.cache[require.resolve('dotenv')];
require('dotenv').config({ path: envPath });

const testKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY;
console.log('Test key result:', testKey ? testKey.substring(0, 10) + '...' : 'NOT FOUND');

console.log('\n💡 If still not working, restart your Next.js dev server'); 