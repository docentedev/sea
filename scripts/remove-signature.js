const { execSync } = require('child_process');
const fs = require('fs');

const platform = process.platform;
const binaryName = platform === 'win32' ? 'sea-server.exe' : 'sea-server';

console.log('🔐 Removiendo firma del binario...');

try {
  if (platform === 'darwin') {
    // macOS
    if (fs.existsSync(binaryName)) {
      execSync(`codesign --remove-signature ${binaryName}`, { stdio: 'inherit' });
      console.log('✅ Firma removida en macOS');
    }
  } else if (platform === 'win32') {
    // Windows (opcional)
    console.log('⚠️  En Windows, la remoción de firma es opcional');
    console.log('💡 Si tienes signtool disponible, puedes usarlo manualmente');
  } else {
    // Linux/Unix - no necesita remoción de firma
    console.log('✅ Linux no requiere remoción de firma');
  }
} catch (error) {
  console.error('❌ Error removiendo firma:', error.message);
  console.log('⚠️  Continuando sin remover firma...');
}