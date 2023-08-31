const express = require('express');
const http = require('http');
const path = require('path');
const exphbs = require('express-handlebars');
const { ProductManager } = require('./ProductManager.js');
const { CartManager } = require('./CartManager.js');
const socketIO = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 8080;

// Conexión a la base de datos MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
    console.log('Conexión exitosa a MongoDB');
});

// Definir esquema de producto
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    availability: Boolean
});

const Product = mongoose.model('Product', productSchema); // Crear modelo Product

// Instancia de ProductManager y CartManager
const productManager = new ProductManager('./data/products.json');
const cartManager = new CartManager('./data/cart.json');

const hbs = exphbs.create({
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.json());

// Endpoint para obtener los productos desde MongoDB
app.get('/api/products', async (req, res) => {
    // ... Código relacionado con MongoDB ...

    res.json(response);
});

// Endpoint para obtener los productos
app.get('/api/products', (req, res) => {
    const { limit } = req.query;
    let products = productManager.getProducts();

    if (limit) {
        const limitNum = parseInt(limit);
        products = products.slice(0, limitNum);
    }

    res.json(products);
});

// Endpoint para obtener los producto por su ID
app.get('/api/products/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    const product = productManager.getProductById(productId);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// Ruta POST para agregar un nuevo producto
app.post('/api/products', (req, res) => {
    const newProduct = req.body;
    productManager.addProduct(newProduct);
    
    // Emitir evento de nuevo producto a través de sockets
    io.emit('productoCreado', newProduct);

    res.json(newProduct);
});

// Ruta PUT para actualizar un producto por su ID
app.put('/api/products/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    const fieldsToUpdate = req.body;
    productManager.updateProduct(productId, fieldsToUpdate);
    
    // Emitir evento de actualización a través de sockets
    io.emit('productoActualizado', productId);

    res.json({ message: 'Product updated successfully' });
});

// Ruta DELETE para eliminar un producto por su ID
app.delete('/api/products/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    productManager.deleteProduct(productId);
    
    // Emitir evento de eliminación a través de sockets
    io.emit('productoEliminado', productId);

    res.json({ message: 'Product deleted successfully' });
});

// Nuevos endpoints para la gestión de carritos
app.post('/api/carts', (req, res) => {
    const newCart = req.body;
    cartManager.addCart(newCart);
    
    res.json(newCart);
});

app.post('/api/carts/:cid/products', (req, res) => {
    const cartId = parseInt(req.params.cid);
    const { productId, quantity } = req.body;

    cartManager.addProductToCart(cartId, productId, quantity);

    res.json({ message: 'Product added to cart successfully' });
});

app.put('/api/carts/:cid/products/:pid', (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const { quantity } = req.body;

    cartManager.updateProductQuantity(cartId, productId, quantity);

    res.json({ message: 'Product quantity updated successfully' });
});

app.delete('/api/carts/:cid/products/:pid', (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);

    cartManager.removeProductFromCart(cartId, productId);

    res.json({ message: 'Product removed from cart successfully' });
});

app.delete('/api/carts/:cid', (req, res) => {
    const cartId = parseInt(req.params.cid);

    cartManager.clearCart(cartId);

    res.json({ message: 'Cart cleared successfully' });
});

// Ruta para la vista de detalles del carrito
app.get('/carts/:cid', (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productsInCart = cartManager.getProductsInCart(cartId);
    res.render('cartDetails', { products: productsInCart }); // Asegúrate de tener una vista "cartDetails.handlebars"
});

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la vista en tiempo real utilizando Handlebars y WebSockets
app.get('/realtimeproducts', (req, res) => {
    const products = productManager.getProducts();
    res.render('realTimeProducts', { products }); // Asegúrate de tener una vista "realTimeProducts.handlebars"
});

// Manejar conexiones de socket.io
io.on('connection', (socket) => {
    console.log('Usuario conectado por WebSocket');

    socket.on('productoCreado', (newProduct) => {
        // Manejar evento de nuevo producto
        console.log('Nuevo producto:', newProduct);
    });

    socket.on('productoActualizado', (productId) => {
        // Manejar evento de producto actualizado
        console.log('Producto actualizado:', productId);
    });

    socket.on('productoEliminado', (productId) => {
        // Manejar evento de producto eliminado
        console.log('Producto eliminado:', productId);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado por WebSocket');
    });
});


// Iniciar el servidor
server.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
