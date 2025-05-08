// Script para verificar token de Telegram
const https = require('https');

// Token del bot
const TOKEN = '8164384647:AAEYrQIJeWf__fXdFKiqZRqfCjhHG5kGdJA';

// URL para verificar el token
const url = `https://api.telegram.org/bot${TOKEN}/getMe`;

console.log(`Verificando token del bot: ${TOKEN}`);
console.log(`URL: ${url}`);

// Hacer petición a la API de Telegram
https.get(url, (res) => {
  let data = '';
  
  // Recibir datos
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // Finalizar petición
  res.on('end', () => {
    console.log('Respuesta de Telegram:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (response.ok) {
        console.log('\n✅ Token VÁLIDO. El bot existe y está activo.');
        console.log(`- ID: ${response.result.id}`);
        console.log(`- Nombre: ${response.result.first_name}`);
        console.log(`- Username: @${response.result.username}`);
      } else {
        console.log('\n❌ Token INVÁLIDO o error en la API.');
        console.log(`- Código de error: ${response.error_code}`);
        console.log(`- Descripción: ${response.description}`);
      }
    } catch (e) {
      console.log('Error parseando respuesta:', e.message);
      console.log('Datos recibidos:', data);
    }
  });
}).on('error', (err) => {
  console.log('Error en la petición HTTP:', err.message);
});

console.log('Petición enviada, esperando respuesta...');
