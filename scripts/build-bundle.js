const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Función para copiar directorio recursivamente
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

esbuild.build({
  entryPoints: ['dist/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/sea-bundle.js',
  format: 'cjs',
  minify: false,
  sourcemap: false,
  external: [],
  banner: {
    js: '#!/usr/bin/env node',
  },
}).then(() => {
  // Copiar archivos estáticos de React al bundle
  console.log('📁 Copying React static files to dist...');
  if (fs.existsSync('public')) {
    copyDir('public', 'dist/public');
    console.log('✅ React static files copied successfully');
  } else {
    console.log('⚠️  No public directory found');
  }
}).catch(() => process.exit(1));