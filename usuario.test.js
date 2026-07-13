// 1. Simulamos la función que valida los datos del cliente en el registro
function validarDatosCliente(nombre, identificacion, telefono) {
    // Verifica que ningún campo esté vacío
    if (!nombre || !identificacion || !telefono) {
        return false;
    }
    // Verifica que la cédula o documento tenga al menos 6 dígitos
    if (identificacion.toString().length < 6) {
        return false;
    }
    // Si pasa todas las validaciones, los datos son correctos
    return true;
}

// 2. Definimos las pruebas para el Módulo de Usuarios
describe('Validación de Registro de Clientes - GESBOX', () => {

    test('Debe aprobar el registro si todos los datos son correctos', () => {
        const esValido = validarDatosCliente('Juan Perez', '100200300', '3201234567');
        expect(esValido).toBe(true);
    });

    test('Debe rechazar el registro si falta algún dato (ej. teléfono)', () => {
        const esValido = validarDatosCliente('Ana Gomez', '100200300', '');
        expect(esValido).toBe(false);
    });

    test('Debe rechazar el registro si la identificación tiene menos de 6 dígitos', () => {
        const esValido = validarDatosCliente('Luis Carlos', '12345', '3119998877');
        expect(esValido).toBe(false);
    });

});