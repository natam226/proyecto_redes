const express = require('express');
const router = express.Router();
const cursosModel = require('../models/cursosModel');
const axios = require('axios');

// Obtener cursos que un estudiante matriculó en el semestre pasado
router.get('/cursos/estudiante/:usuarioEstudiante/periodo-pasado', async (req, res) => {
    const { usuarioEstudiante } = req.params;
    try {
        const responseEstudiante = await axios.get(`http://localhost:3005/estudiantes/${usuarioEstudiante}`);
        const { nombre: nombreEstudiante } = responseEstudiante.data;

        const cursos = await cursosModel.obtenerCursosPorEstudianteYPeriodo(nombreEstudiante, '2024-1');
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ error: `Error al obtener los cursos del estudiante en el semestre pasado: ${error.message}` });
    }
});

// Obtener cursos que un estudiante está cursando actualmente
router.get('/cursos/estudiante/:usuarioEstudiante/actual', async (req, res) => {
    const { usuarioEstudiante } = req.params;
    try {
        const responseEstudiante = await axios.get(`http://localhost:3005/estudiantes/${usuarioEstudiante}`);
        const { nombre: nombreEstudiante } = responseEstudiante.data;

        const cursos = await cursosModel.obtenerCursosPorEstudianteYPeriodo(nombreEstudiante, '2024-03');
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ error: `Error al obtener los cursos actuales del estudiante: ${error.message}` });
    }
});

// Obtener cursos de un profesor en un periodo específico
router.get('/cursos/profesor/:usuarioProfesor/:periodo', async (req, res) => {
    const { usuarioProfesor, periodo } = req.params;
    try {
        const responseProfesor = await axios.get(`http://localhost:3005/profesores/${usuarioProfesor}`);
        const { nombre: nombreProfesor } = responseProfesor.data;

        const cursos = await cursosModel.obtenerCursosPorProfesorYPeriodo(nombreProfesor, periodo);
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ error: `Error al obtener los cursos del profesor: ${error.message}` });
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

// Obtener detalles de un curso por ID
router.get('/cursos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const curso = await cursosModel.traerCursoPorId(id);

        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }

        const profesorResponse = await axios.get(`http://localhost:3005/profesores/${curso.profesor}`);
        const profesor = profesorResponse.data;

        const asignaturaResponse = await axios.get(`http://localhost:3006/asignaturas/${curso.idAsignatura}`);
        const asignatura = asignaturaResponse.data;

        res.json({
            id: curso.id,
            nombreCurso: asignatura.nombreAsignatura,
            grupo: curso.grupo,
            profesor: profesor.nombre,
            nombreEstudiante: curso.nombreEstudiante,
            correoEstudiante: curso.correoEstudiante,
            nota: curso.nota,
            periodo: curso.periodo
        });
    } catch (error) {
        res.status(500).json({ error: `Error al obtener el curso: ${error.message}` });
    }
});



// Matricular un estudiante en un curso
router.post('/cursos/matricular', async (req, res) => {
    const { usuarioEstudiante, idAsignatura } = req.body;

    if (!usuarioEstudiante || !idAsignatura) {
        return res.status(400).json({ error: 'Faltan datos en la solicitud' });
    }

    try {
        // Obtener datos de la asignatura
        const responseAsignatura = await axios.get(`http://localhost:3006/asignaturas/${idAsignatura}`);
        const { nombre, cupos, creditos } = responseAsignatura.data;

        if (typeof cupos !== 'number' || typeof creditos !== 'number' || isNaN(cupos) || isNaN(creditos)) {
            throw new Error('Datos de asignatura inválidos');
        }

        // Obtener datos del estudiante
        const responseEstudiante = await axios.get(`http://localhost:3005/estudiantes/${usuarioEstudiante}`);
        const { nombre: nombreEstudiante, correo: correoEstudiante, totalCreditos } = responseEstudiante.data;

        if (isNaN(totalCreditos) || typeof totalCreditos !== 'number') {
            throw new Error('Total de créditos inválido');
        }

        if (totalCreditos + creditos > 18) {
            return res.status(400).json({ error: 'El estudiante supera el límite de 18 créditos' });
        }

        // Validar cupos disponibles en la asignatura
        if (cupos <= 0) {
            return res.status(400).json({ error: 'No hay cupos disponibles' });
        }

        // Asignar un profesor al azar
        const responseProfesores = await axios.get('http://localhost:3005/profesores');
        const profesores = responseProfesores.data;
        if (profesores.length === 0) {
            return res.status(400).json({ error: 'No hay profesores disponibles para asignar' });
        }

        const profesor = profesores[Math.floor(Math.random() * profesores.length)];
        const grupo = await cursosModel.obtenerNuevoGrupo(); // Obtén el nuevo grupo disponible

        // Crear el nuevo curso
        const nuevoCurso = {
            nombreCurso: nombre,
            grupo: grupo,
            profesor: profesor.usuario,
            nombreEstudiante: nombreEstudiante,
            correoEstudiante: correoEstudiante,
            nota: null,
            periodo: '2024-03'
        };

        await cursosModel.crearCurso(nuevoCurso);
        await axios.put(`http://localhost:3006/asignaturas/${idAsignatura}`, { cupos: cupos - 1 });
        await axios.put(`http://localhost:3005/estudiantes/${usuarioEstudiante}`, { totalCreditos: totalCreditos + creditos }); // Actualiza el total de créditos del estudiante

        res.status(201).json({ message: 'Estudiante matriculado exitosamente' });
    } catch (error) {
        console.error('Error en POST /cursos/matricular:', error.message);
        res.status(500).json({ error: `Error al matricular estudiante: ${error.message}` });
    }
});


module.exports = router;
