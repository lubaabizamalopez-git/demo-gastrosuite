const axios = require('axios');

async function seed() {
  for (let i = 1; i <= 10; i++) {
    try {
      const payload = {
        nombre: `Funcionario ${i}`,
        apellidoPaterno: `Paterno${i}`,
        apellidoMaterno: `Materno${i}`,
        correo: `empleado${i}@gastrosuite.com`,
        clave: '12345678',
        codigoPin: `100${i === 10 ? '0' : i}`,
        estado: 'A',
        tipoDocumento: 'RUT',
        rut: `1${i}000000`,
        telefono: `+5691234567${i % 10}`,
        direccion: `Direccion de prueba ${i}`,
        regionId: 1,
        ciudadId: 1,
        comunaId: 1,
        contactoEmergenciaNombre: `Contacto ${i}`,
        contactoEmergenciaTelefono: `+5699876543${i % 10}`,
        imagenUrl: `https://i.pravatar.cc/150?img=${i + 10}`,
        rol: i % 2 === 0 ? 'MESERO' : 'CAJERO'
      };

      await axios.post('http://localhost:3000/usuarios', payload);
      console.log(`Creado empleado ${i}`);
    } catch (err) {
      console.log(`Error creando empleado ${i}:`, err.response?.data?.message || err.message);
    }
  }
}
seed();
