const express = require('express');
const app = express();
const ProductManager = require('./Entregable03');

const productManager = new ProductManager('./src/products.json');


// Endpoint para obtener todos los productos
app.get('/products', async (req, res) => {
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
app.get('/products/:pid', async (req, res) => {
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

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});