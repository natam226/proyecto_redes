const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306',
    database: 'cursosDB'
});

async function obtenerCursosPorEstudianteYPeriodo(nombreEstudiante, periodo) {
    const [result] = await connection.query(
        `SELECT * FROM cursos WHERE nombreEstudiante = ? AND periodo = ?`, 
        [nombreEstudiante, periodo]
    );
    return result;
}

async function obtenerCursosPorProfesorYPeriodo(nombreProfesor, periodo) {
    const [result] = await connection.query(
        `SELECT * FROM cursos WHERE profesor = ? AND periodo = ?`,
        [nombreProfesor, periodo]
    );
    return result;
}

async function obtenerTodosLosCursos() {
    const [result] = await connection.query('SELECT * FROM cursos');
    return result;
}

async function traerCursoPorId(id) {
    const [result] = await connection.query('SELECT * FROM cursos WHERE id = ?', [id]);
    return result[0];
}

async function crearCurso(curso) {
    const { nombreCurso, grupo, profesor, nombreEstudiante, correoEstudiante, nota, periodo } = curso;
    try {
        const [result] = await connection.query(
            `INSERT INTO cursos (nombreCurso, grupo, profesor, nombreEstudiante, correoEstudiante, nota, periodo) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombreCurso, grupo, profesor, nombreEstudiante, correoEstudiante, nota, periodo]
        );
        return result;
    } catch (error) {
        console.error('Error en crearCurso:', error.message);
        throw error;
    }
}


async function actualizarNota(idCurso, nombreEstudiante, nota) {
    const [result] = await connection.query(
        `UPDATE cursos SET nota = ? WHERE id = ? AND nombreEstudiante = ?`,
        [nota, idCurso, nombreEstudiante]
    );
    return result;
}

async function obtenerNuevoGrupo() {
    try {

        const [result] = await connection.query('SELECT MAX(grupo) AS maxGrupo FROM cursos');
        const maxGrupo = result[0].maxGrupo || 0; 
        return maxGrupo + 1;
    } catch (error) {
        console.error('Error en obtenerNuevoGrupo:', error.message);
        throw error;
    }
}

module.exports = {
    obtenerCursosPorEstudianteYPeriodo,
    obtenerCursosPorProfesorYPeriodo,
    obtenerTodosLosCursos,
    traerCursoPorId,
    crearCurso,
    actualizarNota,
    obtenerNuevoGrupo
};
