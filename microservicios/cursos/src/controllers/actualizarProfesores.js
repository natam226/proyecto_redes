const mysql = require('mysql2/promise');

// Configura la conexión a la base de datos
const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    port: '3306',
    database: 'cursosDB'
});

async function actualizarProfesores() {
    try {
        // Paso 1: Obtener todas las combinaciones únicas de nombreCurso, grupo y periodo
        const [combinaciones] = await connection.query(`
            SELECT DISTINCT nombreCurso, grupo, periodo 
            FROM cursos
        `);

        // Paso 2: Iterar sobre cada combinación y actualizar los profesores
        for (const { nombreCurso, grupo, periodo } of combinaciones) {
            // Encuentra el primer profesor y su correo asignado para esta combinación
            const [result] = await connection.query(`
                SELECT profesor, correoProfesor 
                FROM cursos 
                WHERE nombreCurso = ? AND grupo = ? AND periodo = ?
                LIMIT 1
            `, [nombreCurso, grupo, periodo]);

            if (result.length > 0) {
                const { profesor, correoProfesor } = result[0];

                // Actualiza todos los cursos con el mismo nombreCurso, grupo y periodo con el profesor y correo encontrados
                await connection.query(`
                    UPDATE cursos 
                    SET profesor = ?, correoProfesor = ? 
                    WHERE nombreCurso = ? AND grupo = ? AND periodo = ?
                `, [profesor, correoProfesor, nombreCurso, grupo, periodo]);

                console.log(`Actualizado: ${nombreCurso}, ${grupo}, ${periodo} con profesor ${profesor} y correo ${correoProfesor}`);
            } else {
                console.log(`No se encontró profesor para: ${nombreCurso}, ${grupo}, ${periodo}`);
            }
        }
    } catch (error) {
        console.error('Error al actualizar los profesores:', error.message);
    } finally {
        await connection.end();
    }
}

// Ejecutar la función de actualización
actualizarProfesores();
