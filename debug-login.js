// Script de depuración para el login
console.log('=== DEBUG LOGIN ===');
console.log('URL actual:', window.location.href);
console.log('localStorage auth_token:', localStorage.getItem('auth_token'));
console.log('localStorage auth_user:', localStorage.getItem('auth_user'));

// Limpiar localStorage si es necesario
if (localStorage.getItem('auth_token')) {
  console.log('Limpiando tokens antiguos...');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  console.log('Tokens limpiados, recargando página...');
  window.location.reload();
}
