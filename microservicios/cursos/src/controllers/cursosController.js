const express = require('express');
const router = express.Router();
const cursosModel = require('../models/cursosModel');
const axios = require('axios');

// Obtener cursos de un estudiante en un periodo específico
router.get('/cursos/estudiante/:nombre', async (req, res) => {
    const { nombre } = req.params;
    const periodo = '2024-3'; // Define el periodo actual aquí

    if (!nombre) {
        return res.status(400).json({ error: 'Falta el parámetro de nombre' });
    }

    try {
        // Cambia la función para buscar por nombre en lugar de usuario
        const cursos = await cursosModel.obtenerCursosPorEstudianteYPeriodo(nombre, periodo);

        if (cursos.length === 0) {
            return res.status(404).json({ error: 'Cursos no encontrados' });
        }

        res.json(cursos);
    } catch (error) {
        console.error('Error al obtener cursos:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener cursos pasados de un estudiante
router.get('/cursos/pasados/estudiante/:nombre', async (req, res) => {
    const { nombre } = req.params;

    if (!nombre) {
        return res.status(400).json({ error: 'Falta el parámetro de nombre' });
    }

    try {
        // Cambia la función para buscar por nombre en lugar de usuario
        const cursos = await cursosModel.obtenerCursosPasadosPorEstudiante(nombre);

        if (cursos.length === 0) {
            return res.status(404).json({ error: 'Cursos pasados no encontrados' });
        }

        res.json(cursos);
    } catch (error) {
        console.error('Error al obtener cursos pasados:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener cursos de un profesor en el periodo actual (2024-3)
router.get('/cursos/profesor/:correoProfesor', async (req, res) => {
    const { correoProfesor } = req.params;
    const periodoActual = '2024-3'; // Define el periodo actual aquí

    if (!correoProfesor) {
        return res.status(400).json({ error: 'Falta el parámetro de correo del profesor' });
    }

    try {
        const cursos = await cursosModel.obtenerCursosPorProfesorYPeriodo(correoProfesor, periodoActual);

        if (cursos.length === 0) {
            return res.status(404).json({ error: 'Cursos no encontrados' });
        }

        res.json(cursos);
    } catch (error) {
        console.error('Error al obtener cursos del profesor:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener todos los cursos sin ningún filtro
router.get('/cursos', async (req, res) => {
    try {
        const cursos = await cursosModel.obtenerTodosLosCursos();
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ error: `Error al obtener todos los cursos: ${error.message}` });
    }
});

// Obtener cursos por grupo y nombre de los periodos pasados
router.get('/cursos/:grupo/:nombreCurso', async (req, res) => {
    const { grupo, nombreCurso } = req.params;
    const periodo = '2024-1'; // Define el periodo aquí

    if (!grupo || !nombreCurso) {
        return res.status(400).json({ error: 'Faltan parámetros de búsqueda' });
    }

    try {
        const cursos = await cursosModel.obtenerCursosPorGrupoYNombre(grupo, nombreCurso, periodo);

        if (cursos.length === 0) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        const resultados = await Promise.all(cursos.map(async (curso) => {
            // Solicita la información del profesor
            const profesorResponse = await axios.get(`http://localhost:3005/profesores/${curso.profesor}`);
            const profesor = profesorResponse.data;

            return {
                id: curso.id,
                nombreCurso: curso.nombreCurso,
                grupo: curso.grupo,
                profesor: profesor.nombre,
                nombreEstudiante: curso.nombreEstudiante,
                correoEstudiante: curso.correoEstudiante,
                nota: curso.nota,
                periodo: curso.periodo
            };
        }));

        res.json(resultados);
    } catch (error) {
        console.error('Error al obtener cursos por grupo y nombre del curso:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Matricular un estudiante en un curso
router.post('/cursos/matricular', async (req, res) => {
    const { usuarioEstudiante, idAsignatura } = req.body;
    const periodo = req.query.periodo || '2024-3'; // Usar el período de consulta o un valor predeterminado

    if (!usuarioEstudiante || !idAsignatura) {
        return res.status(400).json({ error: 'Faltan datos en la solicitud' });
    }

    try {
        // Obtener detalles de la asignatura
        const responseAsignatura = await axios.get(`http://localhost:3006/asignaturas/${idAsignatura}`);
        const nombreAsignatura = responseAsignatura.data.nombreAsignatura || 'Nombre no disponible';
        let cupos = Number(responseAsignatura.data.cupos) || 0;
        const creditos = Number(responseAsignatura.data.creditos) || 0;

        if (isNaN(cupos) || isNaN(creditos)) {
            throw new Error('Datos de asignatura inválidos');
        }

        // Obtener detalles del estudiante
        const responseEstudiante = await axios.get(`http://localhost:3005/estudiantes/${usuarioEstudiante}`);
        const nombreEstudiante = responseEstudiante.data.nombre || 'Nombre no disponible';
        const correoEstudiante = responseEstudiante.data.correo || 'Correo no disponible';
        const totalCreditos = Number(responseEstudiante.data.totalCreditos) || 0;

        if (isNaN(totalCreditos)) {
            throw new Error('Total de créditos inválido');
        }

        if (totalCreditos + creditos > 18) {
            return res.status(400).json({ error: 'El estudiante supera el límite de 18 créditos' });
        }

        if (cupos <= 0) {
            return res.status(400).json({ error: 'No hay cupos disponibles' });
        }

        // Verificar si el estudiante puede matricularse en esta asignatura
        const asignaturasNoCursadas = await cursosModel.obtenerAsignaturasNoCursadasPorEstudiante(usuarioEstudiante, periodo);
        const asignaturasConNotaBaja = await cursosModel.obtenerAsignaturasCursadasConNotaBaja(usuarioEstudiante, periodo);
        
        if (!asignaturasNoCursadas.includes(nombreAsignatura) && !asignaturasConNotaBaja.includes(nombreAsignatura)) {
            return res.status(400).json({ error: 'El estudiante no puede matricularse en esta asignatura' });
        }

        // Obtener el grupo disponible para el curso
        const grupo = await cursosModel.obtenerNuevoGrupo(nombreAsignatura, periodo);

        // Verificar cupos disponibles para el grupo
        const cursosEnGrupo = await cursosModel.obtenerCursosPorGrupoYNombre(grupo, nombreAsignatura, periodo);
        if (cursosEnGrupo.length >= 20) {
            return res.status(400).json({ error: `El grupo ${grupo} ya está lleno para la asignatura ${nombreAsignatura}` });
        }

        // Obtener profesor asignado para el curso, grupo y periodo
        let profesor = await cursosModel.obtenerProfesorPorCursoYGrupo(nombreAsignatura, grupo, periodo);

        // Si no se encontró un profesor asignado, asignar uno aleatorio
        if (!profesor) {
            const responseProfesores = await axios.get('http://localhost:3005/profesores');
            const profesores = responseProfesores.data;
            if (profesores.length === 0) {
                return res.status(400).json({ error: 'No hay profesores disponibles para asignar' });
            }
            profesor = profesores[Math.floor(Math.random() * profesores.length)].nombre;
        }

        // Crear el nuevo curso
        const nuevoCurso = {
            nombreCurso: nombreAsignatura,
            grupo: grupo,
            profesor: profesor,
            nombreEstudiante: nombreEstudiante,
            correoEstudiante: correoEstudiante,
            nota: null,
            periodo: periodo
        };

        // Intentar crear el curso y manejar errores de entrada duplicada
        try {
            await cursosModel.crearCurso(nuevoCurso);
            await axios.put(`http://localhost:3006/asignaturas/${idAsignatura}/cupos`, { cupos: cupos - 1 });
            await axios.put(`http://localhost:3005/estudiantes/${usuarioEstudiante}/totalCreditos`, { totalCreditos: totalCreditos + creditos });
            res.status(201).json({ message: 'Estudiante matriculado exitosamente' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ error: 'El estudiante ya está matriculado en este curso' });
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error('Error al matricular estudiante:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
