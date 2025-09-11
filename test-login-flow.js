// Script de prueba para el login
console.log('=== INICIANDO PRUEBA DE LOGIN ===');

// 1. Limpiar localStorage
console.log('1. Limpiando localStorage...');
localStorage.clear();
console.log('   - Token después de limpiar:', localStorage.getItem('auth_token'));
console.log('   - Usuario después de limpiar:', localStorage.getItem('auth_user'));

// 2. Verificar estado inicial
console.log('2. Estado inicial de la aplicación');
console.log('   - URL actual:', window.location.href);
console.log('   - Elementos en página:', document.querySelectorAll('app-login').length > 0 ? 'Login component presente' : 'Login component no encontrado');

// 3. Buscar y hacer clic en el botón de test
setTimeout(() => {
  console.log('3. Buscando botón de test...');
  const testButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Prueba Login'));
  
  if (testButton) {
    console.log('   - Botón de test encontrado:', testButton.textContent?.trim());
    console.log('   - Haciendo clic en el botón de test...');
    testButton.click();
  } else {
    console.log('   - Botón de test NO encontrado');
    console.log('   - Botones disponibles:');
    document.querySelectorAll('button').forEach((btn, index) => {
      console.log(`     ${index + 1}. "${btn.textContent?.trim()}"`);
    });
  }
}, 1000);

// 4. Verificar resultado después de 3 segundos
setTimeout(() => {
  console.log('4. Verificando resultado después del test...');
  console.log('   - URL después del test:', window.location.href);
  console.log('   - Token después del test:', localStorage.getItem('auth_token'));
  console.log('   - Usuario después del test:', localStorage.getItem('auth_user'));
  
  if (window.location.href.includes('/dashboard')) {
    console.log('   ✅ ÉXITO: Redirección al dashboard completada');
  } else {
    console.log('   ❌ FALLO: No se redirigió al dashboard');
  }
}, 3000);
