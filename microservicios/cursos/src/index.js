// index.js
const express = require('express');
const cursosController = require('./controllers/cursosController');
const morgan = require('morgan');
const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use(cursosController); // Asegúrate de usar un prefijo para evitar conflictos con otras rutas

app.listen(3007, () => { // El puerto del microservicio es 3007
    console.log('Microservicio Cursos ejecutándose en el puerto 3007');
});
