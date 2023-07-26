const express = require('express');
const app = express();
const ProductManager = require('./Entregable03');
const CartManager = require('./cartManager');

const productManager = new ProductManager('./src/products.json');
const cartManager = new CartManager('./src/carrito.json');

app.use(express.json());

// Endpoint para obtener todos los productos
app.get('/api/products', async (req, res) => {
  try {
    const limit = req.query.limit;
    const products = productManager.getProducts();

    if (limit) {
      const limitedProducts = products.slice(0, limit);
      res.json(limitedProducts);
    } else {
      res.json(products);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para obtener un producto por ID
app.get('/api/products/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = productManager.getProductById(productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para agregar un nuevo producto
app.post('/api/products', (req, res) => {
  try {
    const product = req.body;
    productManager.addProduct(product);
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para actualizar un producto por ID
app.put('/api/products/:pid', (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const fieldsToUpdate = req.body;
    productManager.updateProduct(productId, fieldsToUpdate);
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para eliminar un producto por ID
app.delete('/api/products/:pid', (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    productManager.deleteProduct(productId);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para crear un nuevo carrito
app.post('/api/carts', (req, res) => {
  try {
    const cart = { products: [] };
    const cartId = cartManager.addCart(cart);
    res.status(201).json({ message: 'Cart created successfully', cartId });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para listar los productos en un carrito
app.get('/api/carts/:cid', (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const products = cartManager.getProductsInCart(cartId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint para agregar un producto a un carrito
app.post('/api/carts/:cid/product/:pid', (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const quantity = req.body.quantity || 1;
    cartManager.addProductToCart(cartId, productId, quantity);
    res.json({ message: 'Product added to cart successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Iniciar el servidor
app.listen(8080, () => {
  console.log('Server is running on port 8080');
});