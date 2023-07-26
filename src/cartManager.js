const fs = require('fs');

class CartManager {
  constructor(path) {
    this.path = path;
    this.loadCarts();
  }

  loadCarts() {
    try {
      const data = fs.readFileSync(this.path, 'utf-8');
      this.carts = JSON.parse(data);
    } catch (error) {
      console.log('Error loading carts:', error.message);
      this.carts = []; // Inicializar el array de carritos si hay un error al cargar el archivo
    }
  }

  saveCarts() {
    try {
      const data = JSON.stringify(this.carts, null, 2);
      fs.writeFileSync(this.path, data, 'utf-8');
    } catch (error) {
      console.log('Error saving carts:', error.message);
    }
  }

  addCart(cart) {
    const newCart = { ...cart };

    if (this.carts.length === 0) {
      newCart.id = 1;
    } else {
      newCart.id = this.carts[this.carts.length - 1].id + 1;
    }

    this.carts.push(newCart);
    this.saveCarts();
    return newCart.id;
  }

  getCartById(id) {
    return this.carts.find((cart) => cart.id === id);
  }

  addProductToCart(cartId, productId, quantity) {
    const cartIndex = this.carts.findIndex((cart) => cart.id === cartId);

    if (cartIndex !== -1) {
      const cart = this.carts[cartIndex];
      const existingProduct = cart.products.find((product) => product.productId === productId);

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }

      this.saveCarts();
    } else {
      console.log('Cart not found');
    }
  }

  getProductsInCart(cartId) {
    const cart = this.getCartById(cartId);

    if (cart) {
      return cart.products;
    } else {
      console.log('Cart not found');
      return [];
    }
  }
}

module.exports = CartManager;
