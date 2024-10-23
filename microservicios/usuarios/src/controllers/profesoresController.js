const { Router } = require('express');
const router = Router();
const profesoresModel = require('../models/profesoresModel'); //se especifica que se va a usar el modelo, que es la lógica de los datos



router.get('/profesores', async (req, res) => { 
    var result;
    result = await profesoresModel.traerProfesores(); //Llama a una función del modelo que se llama traerUsuarios
    //console.log(result);
    res.json(result);
});

router.get('/profesores/:usuario', async (req, res) => {
    const usuario = req.params.usuario;
    var result;
    result = await profesoresModel.traerProfesor(usuario);
    //console.log(result);
    res.json(result[0]);
});

router.get('/correoprof/:usuario', async (req, res) => {
    const usuario = req.params.usuario;
    var result;
    result = await profesoresModel.traerCorreo(usuario);
    //console.log(result);
    res.json(result[0]);
});

// Autenticación del profesor y retorno de la información del profesor
router.get('/profesores/:usuario/:contrasena/:rol', async (req, res) => {
    const usuario = req.params.usuario;
    const contrasena = decodeURIComponent(req.params.contrasena);
    const rol = req.params.rol;

    var result = await profesoresModel.validarProfesor(usuario, contrasena, rol);

    if (result.length > 0) {
        // Devuelve la información completa del profesor
        res.json(result[0]);
    } else {
        res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
});

// Nueva ruta para obtener el perfil del profesor basado en el usuario y la contraseña
router.get('/perfilProfesor/:usuario/:contrasena', async (req, res) => {
    const usuario = req.params.usuario;
    const contrasena = decodeURIComponent(req.params.contrasena);

    var result = await profesoresModel.traerPerfilProfesor(usuario, contrasena);

    if (result.length > 0) {
        res.json(result[0]);
    } else {
        res.status(404).json({ message: 'Perfil no encontrado' });
    }
});

router.post('/profesores', async (req, res) => {
    const usuario = req.body.usuario;
    const contrasena = req.body.contrasena;
    const rol = req.body.rol;
    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const ultimoGradoDeFormacion = req.body.ultimoGradoDeFormacion;

    var result = await profesoresModel.crearProfesor(usuario, contrasena, rol, nombre, correo, ultimoGradoDeFormacion);
    res.send("Profesor creado");
});

router.put('/profesores/:usuario', async (req, res) => {
    const usuario = req.params.usuario;
    const contrasena = req.body.contrasena;
    const nombre = req.body.nombre;
    const correo = req.body.correo;
    const ultimoGradoDeFormacion = req.body.ultimoGradoDeFormacion;

    var result;
    result = await profesoresModel.actualizarProfesor(usuario, contrasena, nombre, correo, ultimoGradoDeFormacion);
    res.send("Profesor actualizado");
});

router.delete('/profesores/:usuario', async (req, res) => {
    const usuario = req.params.usuario;

    var result;
    result = await profesoresModel.borrarProfesor(usuario);
    //console.log(result);
    res.send("Profesor eliminado");
});

module.exports = router;