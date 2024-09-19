const { Router } = require('express');
const router = Router();
const estudiantesModel = require('../models/estudiantesModel'); //se especifica que se va a usar el modelo, que es la lógica de los datos



router.get('/estudiantes', async (req, res) => { 
    var result;
    result = await estudiantesModel.traerEstudiantes(); //Llama a una función del modelo que se llama traerUsuarios
    //console.log(result);
    res.json(result);
});

router.get('/estudiantes/:usuario', async (req, res) => {
    const usuario = req.params.usuario;
    var result;
    result = await estudiantesModel.traerEstudiante(usuario);
    //console.log(result);
    res.json(result[0]);
});

router.get('/estudiantes/:usuario/:contrasena', async (req, res) => {
    const usuario = req.params.usuario;
    const contrasena = req.params.contrasena;

    try {
        const result = await estudiantesModel.validarEstudiante(usuario, contrasena);

        // Verificar si se encontró un estudiante con las credenciales dadas
        if (result.length > 0) {
            // Credenciales válidas
            res.status(200).json({
                success: true,
                message: "Inicio de sesión exitoso",
                data: result[0] // Puedes incluir los datos del estudiante si lo deseas
            });
        } else {
            // Credenciales inválidas
            res.status(401).json({
                success: false,
                message: "Usuario o contraseña incorrectos"
            });
        }
    } catch (error) {
        // Manejo de errores del servidor
        console.error('Error al validar estudiante:', error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
});


router.post('/estudiantes', async (req, res) => {
    const usuario = req.body.usuario;
    const contrasena = req.body.contrasena;
    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const paisOrigen = req.body.paisOrigen;
    const necesidadesEspecialesEducacion = req.body.necesidadesEspecialesEducacion;
    const genero = req.body.genero;
    const estadoCivil = req.body.estadoCivil;
    const prestamo = req.body.prestamo;
    const beca = req.body.beca;
    const desplazado = req.body.desplazado;
    const totalCreditos = 0; // Establece el valor por defecto

    var result;
    result = await estudiantesModel.crearEstudiante(usuario, contrasena, nombre, correo, paisOrigen, necesidadesEspecialesEducacion, genero, estadoCivil, prestamo, beca, desplazado, totalCreditos);
    res.send("Usuario creado");
});


router.put('/estudiantes/:usuario', async (req, res) => {
    const usuario = req.params.usuario;
    const contrasena = req.body.contrasena;
    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const genero = req.body.genero;
    const estadoCivil = req.body.estadoCivil;

    var result;
    result = await estudiantesModel.actualizarEstudiantes(usuario, contrasena, nombre, correo, genero, estadoCivil);
    res.send("Estudiante actualizado");
});

router.put('/estudiantes/:usuario/totalCreditos', async (req, res) => {
    const { usuario } = req.params;
    const { totalCreditos } = req.body;

    if (typeof totalCreditos !== 'number' || totalCreditos < 0) {
        return res.status(400).json({ error: 'Total de créditos debe ser un número no negativo' });
    }

    try {
        const result = await estudiantesModel.actualizarTotalCreditos(usuario, totalCreditos);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }

        res.status(200).json({ message: 'Total de créditos actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar total de créditos del estudiante:', error.message);
        res.status(500).json({ error: 'Error al actualizar el total de créditos del estudiante' });
    }
});

router.delete('/estudiantes/:usuario', async (req, res) => {
    const usuario = req.params.usuario;

    var result;
    result = await estudiantesModel.borrarEstudiante(usuario);
    //console.log(result);
    res.send("Estudiante eliminado");
});


module.exports = router;