#!/usr/bin/env node

/**
 * Automatic API URL Updater for Frontend
 * Usage: node update-api-urls.js https://your-railway-backend.railway.app
 */

const fs = require('fs');
const path = require('path');

const newApiUrl = process.argv[2];

if (!newApiUrl) {
  console.error('❌ Error: Please provide your Railway backend URL');
  console.error('Usage: node update-api-urls.js https://your-backend.railway.app');
  process.exit(1);
}

// Validate URL
if (!newApiUrl.startsWith('http://') && !newApiUrl.startsWith('https://')) {
  console.error('❌ Error: URL must start with http:// or https://');
  process.exit(1);
}

// Remove trailing slash if present
const cleanUrl = newApiUrl.replace(/\/$/, '');

console.log(`🚀 Updating API URLs to: ${cleanUrl}\n`);

// Files to update
const filesToUpdate = [
  'Frontend/inventory_management_system/src/context/AuthContext.js',
  'Frontend/inventory_management_system/src/components/Products.js',
  'Frontend/inventory_management_system/src/components/InsertProduct.js',
  'Frontend/inventory_management_system/src/components/UpdateProduct.js',
  'Frontend/inventory_management_system/src/components/InvoiceGenerator.js',
  'Frontend/inventory_management_system/src/components/SalesHistory.js',
  'Frontend/inventory_management_system/src/components/SalesAnalytics.js',
];

let totalUpdates = 0;

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Replace localhost URLs with new API URL
    const replacements = [
      { from: /http:\/\/localhost:3001/g, to: cleanUrl },
      { from: /'http:\/\/localhost:3001/g, to: `'${cleanUrl}` },
      { from: /"http:\/\/localhost:3001/g, to: `"${cleanUrl}` },
    ];

    let fileUpdates = 0;
    replacements.forEach(({ from, to }) => {
      const matches = content.match(from);
      if (matches) {
        fileUpdates += matches.length;
        content = content.replace(from, to);
      }
    });

    if (fileUpdates > 0) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${filePath}`);
      console.log(`   └─ Updated ${fileUpdates} URL(s)\n`);
      totalUpdates += fileUpdates;
    } else {
      console.log(`⏭️  ${filePath} (no changes needed)\n`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}: ${error.message}`);
  }
});

console.log('═'.repeat(60));
console.log(`\n✅ Complete! Updated ${totalUpdates} API URL(s) in ${filesToUpdate.length} files\n`);
console.log(`🌐 New API URL: ${cleanUrl}`);
console.log('\n📝 Next steps:');
console.log('   1. Commit these changes: git add . && git commit -m "Update API URLs for production"');
console.log('   2. Push to GitHub: git push');
console.log('   3. Vercel will auto-deploy your frontend');
console.log('\n💡 Tip: Deploy your backend to Railway first, then use its URL with this script\n');
