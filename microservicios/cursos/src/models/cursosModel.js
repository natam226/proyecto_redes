const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306',
    database: 'cursosDB'
});

// Obtener todos los cursos
async function obtenerTodosLosCursos() {
    const [rows] = await connection.query('SELECT * FROM cursos');
    return rows;
}

// Traer un curso por ID
async function traerCursoPorId(id) {
    const [rows] = await connection.query('SELECT * FROM cursos WHERE id = ?', [id]);
    return rows[0];
}

// Obtener cursos de un estudiante en un periodo específico
async function obtenerCursosPorEstudianteYPeriodo(correoEstudiante, periodo) {
    const [rows] = await connection.query('SELECT * FROM cursos WHERE correoEstudiante = ? AND periodo = ?', [correoEstudiante, periodo]);
    return rows;
}

// Obtener cursos pasados por estudiante
async function obtenerCursosPasadosPorEstudiante(correoEstudiante) {
    const periodoActual = '2024-3'; // Periodo actual para la consulta
    const [rows] = await connection.query('SELECT * FROM cursos WHERE correoEstudiante = ? AND periodo != ?', [correoEstudiante, periodoActual]);
    return rows;
}

// Obtener cursos de un profesor en un periodo específico
async function obtenerCursosPorProfesorYPeriodo(correoProfesor, periodo) {
    const [rows] = await connection.query('SELECT * FROM cursos WHERE correoProfesor = ? AND periodo = ?', [correoProfesor, periodo]);
    return rows;
}

// Obtener cursos por grupo y nombre
async function obtenerCursosPorGrupoYNombre(grupo, nombreCurso, periodo) {
    const [rows] = await connection.query('SELECT * FROM cursos WHERE grupo = ? AND nombreCurso = ? AND periodo = ?', [grupo, nombreCurso, periodo]);
    return rows;
}

// Obtener correo del profesor por curso y grupo
async function obtenerCorreoProfesorPorCursoYGrupo(nombreCurso, grupo, periodo) {
    try {
        const [rows] = await connection.query('SELECT correoProfesor FROM cursos WHERE nombreCurso = ? AND grupo = ? AND periodo = ?', [nombreCurso, grupo, periodo]);
        return rows[0]?.correoProfesor;
    } catch (error) {
        console.error('Error en obtenerCorreoProfesorPorCursoYGrupo:', error.message);
        throw error;
    }
}

// Crear un nuevo curso
async function crearCurso(curso) {
    const { nombreCurso, grupo, correoProfesor, nombreEstudiante, correoEstudiante, nota, periodo } = curso;

    try {
        const [result] = await connection.query(
            'INSERT INTO cursos (nombreCurso, grupo, correoProfesor, nombreEstudiante, correoEstudiante, nota, periodo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombreCurso, grupo, correoProfesor, nombreEstudiante, correoEstudiante, nota, periodo]
        );
        return result;
    } catch (error) {
        console.error('Error en crearCurso:', error.message);
        throw error;
    }
}

// Actualizar nota de un curso
async function actualizarNota(nombreCurso, grupo, periodo, correoEstudiante, nota) {
    try {
        const [result] = await connection.query(
            'UPDATE cursos SET nota = ? WHERE nombreCurso = ? AND grupo = ? AND periodo = ? AND correoEstudiante = ?',
            [nota, nombreCurso, grupo, periodo, correoEstudiante]
        );
        return result;
    } catch (error) {
        console.error('Error en actualizarNota:', error.message);
        throw error;
    }
}

async function asignaturasPorCursar(usuario) {
    try {
        const [rows] = await connection.query(
            `SELECT a.nombre, a.cupos, a.id
             FROM asignaturasDB.asignaturas a 
             LEFT JOIN cursosDB.cursos c 
             ON TRIM(LOWER(a.nombre)) = TRIM(LOWER(c.nombreCurso)) 
             AND c.correoEstudiante = (SELECT correo FROM usuariosDB.estudiantes WHERE usuario = ?) 
             AND c.nota >= 3.0 
             WHERE c.nombreCurso IS NULL 
             AND a.cupos > 0`, 
            [usuario]
        );
        return rows;
    } catch (error) {
        console.error('Error en asignaturasPorCursar:', error.message);
        throw error;
    }
}

async function obtenerNuevoGrupo(nombreAsignatura, periodo) {
    try {
        // Contar cuántos usuarios hay en cada grupo
        const [rows] = await connection.query(
            'SELECT grupo, COUNT(*) AS cantidad FROM cursos WHERE nombreCurso = ? AND periodo = ? GROUP BY grupo',
            [nombreAsignatura, periodo]
        );

        let grupo1 = 0;
        let grupo2 = 0;

        // Asignar la cantidad de usuarios a las variables grupo1 y grupo2
        rows.forEach(row => {
            if (row.grupo === 1) grupo1 = row.cantidad;
            if (row.grupo === 2) grupo2 = row.cantidad;
        });

        // Si no hay registros, asignar al primer grupo
        if (grupo1 === 0 && grupo2 === 0) {
            return 1;
        }

        // Asignar al grupo con menos usuarios
        if (grupo1 <= grupo2) {
            return 1;
        } else {
            return 2;
        }
    } catch (error) {
        console.error('Error en obtenerNuevoGrupo:', error.message);
        throw error;
    }
}


module.exports = {
    obtenerTodosLosCursos,
    traerCursoPorId,
    obtenerCursosPorEstudianteYPeriodo,
    obtenerCursosPasadosPorEstudiante,
    obtenerCursosPorProfesorYPeriodo,
    obtenerCursosPorGrupoYNombre,
    obtenerCorreoProfesorPorCursoYGrupo,
    crearCurso,
    actualizarNota,
    asignaturasPorCursar,
    obtenerNuevoGrupo,
};