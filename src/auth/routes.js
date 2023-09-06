import { Router } from 'express';
const router = Router();

//Importa el modelo de usuario
import User from '../models/User';

//Ruta para mostrar formulario de inicio de sesión
router.get('/login', (req, res) => {
    res.render('auth/login'); //"login.handlebars"
});

//Ruta para procesar el inicio de sesión
router.post('/login', async (req, res) => {
    const {
        email,
        password
    } = req.body;

    //Verifica las credenciales y redirige al usuario a la vista de productos: pedido de consigna del desafío
    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
        //Establece una sesión para el usuario autenticado: pedido de consigna del desafío
        req.session.user = {
            email: 'adminCoder@coder.com',
            role: 'admin',
        };
        return res.redirect('/products'); //Redirige a la vista de productos
    } else {
        //En caso de credenciales incorrectas, muestra un mensaje de error
        return res.render('auth/login', {
            error: 'Credenciales incorrectas'
        });
    }
});

//Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
    res.render('auth/register'); //"register.handlebars"
});

//Ruta para procesar el registro
router.post('/register', async (req, res) => {
    //Crea un nuevo usuario
    const newUser = new User({
        email: req.body.email,
        password: req.body.password, //Encripta la contraseña
        role: 'usuario', //Establece el rol del usuario
    });

    try {
        await newUser.save();
        //Nuevo usuario registrado
        req.session.user = {
            email: newUser.email,
            role: newUser.role,
        };
        return res.redirect('/products'); //Redirige a productos
    } catch (error) {
        //En caso de error entonces mensaje de error
        return res.render('auth/register', {
            error: 'Error al registrar el usuario'
        });
    }
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    if (req.session.user) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al cerrar sesión:', err);
            }
            res.redirect('/auth/login'); // Redirige a la vista de inicio de sesión
        });
    } else {
        res.redirect('/auth/login'); // Redirige a la vista de inicio de sesión incluso si no hay sesión activa
    }
});


export default router;