const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
        this.loadProducts();
    }

    loadProducts() {
        try {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.products = JSON.parse(data);
        } catch (error) {
            console.log('Error loading products:', error.message);
            this.products = []; //Inicializar el array de productos si hay un error al cargar el archivo
        }
    }

    saveProducts() {
        try {
            const data = JSON.stringify(this.products, null, 2);
            fs.writeFileSync(this.path, data, 'utf-8');
        } catch (error) {
            console.log('Error saving products:', error.message);
        }
    }

    addProduct(product) {
        const newProduct = {...product};

        if (this.products.length === 0) {
            newProduct.id = 1;
        } else {
            newProduct.id = this.products[this.products.length - 1].id + 1;
        }

        this.products.push(newProduct);
        this.saveProducts();
    }

    getProducts() {
        return this.products;
    }

    getProductById(id) {
        const product = this.products.find((product) => product.id === id);
        if (product) {
            return product;
        } else {
            console.log('Product not found');
        }
    }

    updateProduct(id, fieldsToUpdate) {
        const productIndex = this.products.findIndex((product) => product.id === id);

        if (productIndex !== -1) {
            const product = this.products[productIndex];
            const updatedProduct = {...product, ...fieldsToUpdate};
            this.products[productIndex] = updatedProduct;
            this.saveProducts();
        } else {
            console.log('Product not found');
        }
    }

    deleteProduct(id) {
        const productIndex = this.products.findIndex((product) => product.id === id);

        if (productIndex !== -1) {
            this.products.splice(productIndex, 1);
            this.saveProducts();
        } else {
            console.log('Product not found');
        }
    }
}

const productManager = new ProductManager('products.json');

//Obtener los productos
console.log(productManager.getProducts());


//Obtener productos por su id
// createProducts.getProductById(1);
// createProducts.getProductById(2);
// createProducts.getProductById(3);