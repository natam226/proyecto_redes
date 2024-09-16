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
    var result;
    result = await estudiantesModel.validarEstudiante(usuario, contrasena);
    //console.log(result);
    res.json(result[0]);
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
    const desplazado = req.body.beca;

    var result = await estudiantesModel.crearEstudiante(usuario, contrasena, nombre, correo, paisOrigen, necesidadesEspecialesEducacion, genero, estadoCivil, prestamo, beca, desplazado);
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

router.delete('/estudiantes/:usuario', async (req, res) => {
    const usuario = req.params.usuario;

    var result;
    result = await estudiantesModel.borrarEstudiante(usuario);
    //console.log(result);
    res.send("Estudiante eliminado");
});

module.exports = router;