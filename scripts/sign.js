const { execSync } = require('child_process');
const fs = require('fs');

const platform = process.platform;
const binaryName = platform === 'win32' ? 'sea-server.exe' : 'sea-server';

console.log('✍️  Firmando el binario...');

try {
  if (platform === 'darwin') {
    // macOS
    if (fs.existsSync(binaryName)) {
      execSync(`codesign --sign - ${binaryName}`, { stdio: 'inherit' });
      console.log('✅ Binario firmado en macOS');
    }
  } else if (platform === 'win32') {
    // Windows (opcional)
    console.log('⚠️  En Windows, la firma es opcional');
    console.log('💡 Si tienes un certificado, puedes usar signtool manualmente:');
    console.log(`    signtool sign /fd SHA256 ${binaryName}`);
  } else {
    // Linux/Unix - no necesita firma
    console.log('✅ Linux no requiere firma adicional');
  }
  
  // Verificar que el archivo existe y es ejecutable
  if (fs.existsSync(binaryName)) {
    const stats = fs.statSync(binaryName);
    if (platform !== 'win32') {
      // Hacer ejecutable en Unix-like systems
      fs.chmodSync(binaryName, '755');
    }
    console.log(`✅ Binario ${binaryName} creado exitosamente (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  }
} catch (error) {
  console.error('❌ Error firmando binario:', error.message);
  console.log('⚠️  El binario debería funcionar sin firma');
}