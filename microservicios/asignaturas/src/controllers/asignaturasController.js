const { Router } = require('express');
const router = Router();
const asignaturasModel = require('../models/asignaturasModel');

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
    const { nombre, creditos, cupos, semestre } = req.body;
    try {
        await asignaturasModel.crearAsignatura(nombre, creditos, cupos, semestre);
        res.status(201).send('Asignatura creada');
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la asignatura', error });
    }
});

// Actualizar una asignatura
router.put('/asignaturas/:id', async (req, res) => {
    const id = req.params.id;
    const { nombre, creditos, cupos, semestre } = req.body;
    try {
        const result = await asignaturasModel.actualizarAsignatura(id, nombre, creditos, cupos, semestre);
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Asignatura no encontrada' });
        res.send('Asignatura actualizada');
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la asignatura', error });
    }
});

// Eliminar una asignatura
router.delete('/asignaturas/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await asignaturasModel.borrarAsignatura(id);
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Asignatura no encontrada' });
        res.send('Asignatura borrada');
    } catch (error) {
        res.status(500).json({ message: 'Error al borrar la asignatura', error });
    }
});

module.exports = router;
