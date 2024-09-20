const { Router } = require('express');
const router = Router();
const asignaturasModel = require('../models/asignaturasModel');
const axios = require('axios');

// Obtener todas las asignaturas
router.get('/asignaturas', async (req, res) => {
    try {
        const result = await asignaturasModel.traerAsignaturas();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener asignaturas', error });
    }
});

// Obtener una asignatura por ID
router.get('/asignaturas/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await asignaturasModel.traerAsignaturaPorId(id);
        if (result.length === 0) return res.status(404).json({ message: 'Asignatura no encontrada' });
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la asignatura', error });
    }
});

// Crear una nueva asignatura
router.post('/asignaturas', async (req, res) => {
    const { nombreAsignatura, creditos, cupos, semestre } = req.body;  // Cambiar a nombreAsignatura
    try {
        await asignaturasModel.crearAsignatura(nombreAsignatura, creditos, cupos, semestre);
        res.status(201).send('Asignatura creada');
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la asignatura', error });
    }
});

router.get('/asignaturas/pendientes/:usuario', async (req, res) => {
    const { usuario } = req.params;

    if (!usuario) {
        return res.status(400).json({ error: 'Falta el parámetro de usuario' });
    }

    try {
        const asignaturas = await asignaturasPorCursar(usuario);

        if (asignaturas.length === 0) {
            return res.status(404).json({ error: 'No se encontraron asignaturas pendientes por cursar' });
        }

        res.json(asignaturas);
    } catch (error) {
        console.error('Error al obtener asignaturas pendientes:', error.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar una asignatura
router.put('/asignaturas/:id', async (req, res) => {
    const id = req.params.id;
    const { nombreAsignatura, creditos, cupos, semestre } = req.body;  // Cambiar a nombreAsignatura
    try {
        const result = await asignaturasModel.actualizarAsignatura(id, nombreAsignatura, creditos, cupos, semestre);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Asignatura no encontrada' });
        res.send('Asignatura actualizada');
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la asignatura', error });
    }
});

router.put('/asignaturas/:id/cupos', async (req, res) => {
    const { id } = req.params;
    const { cupos } = req.body;

    if (typeof cupos !== 'number') {
        return res.status(400).json({ error: 'Cupos debe ser un número' });
    }

    try {
        await asignaturasModel.actualizarCupos(id, cupos);
        res.status(200).json({ message: 'Cupos de asignatura actualizados exitosamente' });
    } catch (error) {
        console.error('Error al actualizar cupos de asignatura:', error.message);
        res.status(500).json({ error: 'Error al actualizar los cupos de la asignatura' });
    }
});


// Eliminar una asignatura
router.delete('/asignaturas/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await asignaturasModel.borrarAsignatura(id);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Asignatura no encontrada' });
        res.send('Asignatura borrada');
    } catch (error) {
        res.status(500).json({ message: 'Error al borrar la asignatura', error });
    }
});

module.exports = router;
