const mysql = require('mysql2/promise');

// Crear la conexión a la base de datos
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3307',
    database: 'asignaturasDB'
});

// Obtener todas las asignaturas
async function traerAsignaturas() {
    const [rows] = await connection.query('SELECT * FROM asignaturas');
    return rows;
}

// Obtener una asignatura por ID
async function traerAsignaturaPorId(id) {
    const [rows] = await connection.query('SELECT * FROM asignaturas WHERE id = ?', [id]);
    return rows;
}

// Crear una nueva asignatura
async function crearAsignatura(nombre, creditos, cupos, semestre) {
    const [result] = await connection.query('INSERT INTO asignaturas (nombre, creditos, cupos, semestre) VALUES (?, ?, ?, ?)', [nombre, creditos, cupos, semestre]);
    return result;
}

// Actualizar una asignatura existente
async function actualizarAsignatura(id, nombre, creditos, cupos, semestre) {
    const [result] = await connection.query('UPDATE asignaturas SET nombre = ?, creditos = ?, cupos = ?, semestre = ? WHERE id = ?', [nombre, creditos, cupos, semestre, id]);
    return result;
}

// Eliminar una asignatura por ID
async function borrarAsignatura(id) {
    const [result] = await connection.query('DELETE FROM asignaturas WHERE id = ?', [id]);
    return result;
}

module.exports = {
    traerAsignaturas,
    traerAsignaturaPorId,
    crearAsignatura,
    actualizarAsignatura,
    borrarAsignatura
};
