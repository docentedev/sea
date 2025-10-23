const { execSync } = require('child_process');

const platform = process.platform;
const binaryName = platform === 'win32' ? 'sea-server.exe' : 'sea-server';

console.log('💉 Inyectando blob en el binario...');

try {
  let command;
  
  if (platform === 'win32') {
    // Windows
    command = `npx postject ${binaryName} NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`;
  } else if (platform === 'darwin') {
    // macOS
    command = `npx postject ${binaryName} NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA --overwrite`;
  } else {
    // Linux
    command = `npx postject ${binaryName} NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`;
  }

  console.log(`Ejecutando: ${command}`);
  execSync(command, { stdio: 'inherit' });
  console.log('✅ Blob inyectado exitosamente');
} catch (error) {
  console.error('❌ Error inyectando blob:', error.message);
  process.exit(1);
}