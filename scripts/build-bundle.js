const esbuild = require('esbuild');

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
}).catch(() => process.exit(1));