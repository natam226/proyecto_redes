const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3307',
    database: 'cursosDB'
});

// Obtener cursos de un estudiante en un periodo específico
async function obtenerCursosPorEstudianteYPeriodo(nombreEstudiante, periodo) {
    const [rows] = await connection.query('SELECT * FROM cursos WHERE nombreEstudiante = ? AND periodo = ?', [nombreEstudiante, periodo]);
    return rows;
}

// Obtener la nota de un estudiante en una asignatura específica
async function obtenerNotaPorEstudianteYAsignatura(nombreEstudiante, nombreAsignatura, periodo) {
    try {
        const [rows] = await connection.query('SELECT nota FROM cursos WHERE nombreEstudiante = ? AND nombreCurso = ? AND periodo = ?', [nombreEstudiante, nombreAsignatura, periodo]);
        return rows.length > 0 ? rows[0].nota : null;
    } catch (error) {
        console.error('Error en obtenerNotaPorEstudianteYAsignatura:', error.message);
        throw error;
    }
}

// Obtener cursos de un profesor en un periodo específico
async function obtenerCursosPorProfesorYPeriodo(nombreProfesor, periodo) {
    const [rows] = await connection.query('SELECT * FROM cursos WHERE profesor = ? AND periodo = ?', [nombreProfesor, periodo]);
    return rows;
}

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

// Crear un nuevo curso
async function crearCurso(curso) {
    const { nombreCurso, grupo, profesor, nombreEstudiante, correoEstudiante, nota, periodo } = curso;

    // Verificar si el estudiante ya está matriculado en el curso para el periodo actual
    const cursosMatriculados = await obtenerCursosPorEstudianteYPeriodo(nombreEstudiante, periodo);
    const yaMatriculado = cursosMatriculados.some(curso => curso.nombreCurso === nombreCurso);

    if (yaMatriculado) {
        const notaActual = await obtenerNotaPorEstudianteYAsignatura(nombreEstudiante, nombreCurso, periodo);
        if (notaActual !== null && notaActual > 2.9) {
            throw new Error('El estudiante ya está matriculado en esta asignatura para el periodo actual');
        }
    }

    try {
        const [result] = await connection.query(
            'INSERT INTO cursos (nombreCurso, grupo, profesor, nombreEstudiante, correoEstudiante, nota, periodo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombreCurso, grupo, profesor, nombreEstudiante, correoEstudiante, nota, periodo]
        );
        return result;
    } catch (error) {
        console.error('Error en crearCurso:', error.message);
        throw error;
    }
}

// Actualizar nota de un curso
async function actualizarNota(nombreCurso, grupo, periodo, nombreEstudiante, nota) {
    try {
        const [result] = await connection.query(
            'UPDATE cursos SET nota = ? WHERE nombreCurso = ? AND grupo = ? AND periodo = ? AND nombreEstudiante = ?',
            [nota, nombreCurso, grupo, periodo, nombreEstudiante]
        );
        return result;
    } catch (error) {
        console.error('Error en actualizarNota:', error.message);
        throw error;
    }
}

// Obtener el nuevo grupo para un curso
async function obtenerNuevoGrupo(nombreCurso, periodo) {
    try {
        // Obtener el grupo máximo actual para la materia y periodo
        const [rows] = await connection.query('SELECT MAX(grupo) AS maxGrupo FROM cursos WHERE nombreCurso = ? AND periodo = ?', [nombreCurso, periodo]);
        const maxGrupo = rows[0].maxGrupo || 0;
        
        // Calcular el siguiente grupo, con límite en 3
        const siguienteGrupo = (maxGrupo % 3) + 1;
        return siguienteGrupo;
    } catch (error) {
        console.error('Error en obtenerNuevoGrupo:', error.message);
        throw error;
    }
}

// Obtener cursos por grupo y nombre
async function obtenerCursosPorGrupoYNombre(grupo, nombreCurso, periodo) {
    const [rows] = await connection.query('SELECT * FROM cursos WHERE grupo = ? AND nombreCurso = ? AND periodo = ?', [grupo, nombreCurso, periodo]);
    return rows;
}

// Obtener profesor por curso y grupo
async function obtenerProfesorPorCursoYGrupo(nombreCurso, grupo, periodo) {
    try {
        const [rows] = await connection.query('SELECT profesor FROM cursos WHERE nombreCurso = ? AND grupo = ? AND periodo = ?', [nombreCurso, grupo, periodo]);
        return rows[0]?.profesor;
    } catch (error) {
        console.error('Error en obtenerProfesorPorCursoYGrupo:', error.message);
        throw error;
    }
}

// Obtener cursos pasados por estudiante
async function obtenerCursosPasadosPorEstudiante(usuario) {
    const periodoActual = '2024-3'; // Periodo actual para la consulta
    const [rows] = await connection.query('SELECT * FROM cursos WHERE nombreEstudiante = ? AND periodo != ?', [usuario, periodoActual]);
    return rows;
}

// Obtener cursos disponibles para matrícula
async function obtenerCursosDisponiblesParaMatricula(usuarioEstudiante) {
    const [rows] = await connection.query(`
        SELECT c.id, c.nombreCurso, c.grupo, c.creditos, a.nombreAsignatura
        FROM cursos c
        JOIN asignaturas a ON c.nombreCurso = a.nombreAsignatura
        WHERE c.periodo = '2024-03'
          AND NOT EXISTS (
              SELECT 1
              FROM cursos c2
              WHERE c2.nombreCurso = c.nombreCurso
                AND c2.nombreEstudiante = ?
                AND c2.periodo = '2024-03'
          )
        ORDER BY a.nombreAsignatura, c.grupo;
    `, [usuarioEstudiante]);
    return rows;
}

// Verificar matrícula duplicada
async function verificarMatriculaDuplicada(usuarioEstudiante, nombreCurso, periodo) {
    const [rows] = await connection.query('SELECT * FROM cursos WHERE nombreEstudiante = ? AND nombreCurso = ? AND periodo = ?', [usuarioEstudiante, nombreCurso, periodo]);
    return rows.length > 0;
}



module.exports = {
    obtenerCursosPorEstudianteYPeriodo,
    obtenerCursosPorProfesorYPeriodo,
    obtenerTodosLosCursos,
    traerCursoPorId,
    crearCurso,
    actualizarNota,
    obtenerNuevoGrupo,
    obtenerCursosPorGrupoYNombre,
    obtenerProfesorPorCursoYGrupo,
    obtenerCursosPasadosPorEstudiante,
    obtenerNotaPorEstudianteYAsignatura,
    obtenerCursosDisponiblesParaMatricula,
    verificarMatriculaDuplicada
};
