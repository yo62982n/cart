//Variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");


// cart

let cart = []
if(localStorage.cart){
    cart = [...JSON.parse(localStorage.cart)];
    cartItems.innerHTML = cart.length;
}

let buttonsDOM = [];

//getting the products
class Products{
    async getProducts(){
        try{
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;

                return { title, price, id, image}
            });
            
            return products;
        }
        catch(error){
            console.log("Error : ", error);
        }

    }
}

//display products
class UI {
    
    displayProducts(products){
        let results = '';
        
        products.forEach(product => {
            results += `
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fa fas-shopping-cart"></i>
                        add to cart
                    </button>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </div>
            `;
        });
        productsDOM.innerHTML = results;
    }

    getBagButtons(){
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => {
                return item.id === id;
            });
            if(inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            }
            else{
                button.addEventListener('click', (event) => {
                    event.target.innerText = "In Cart";
                    event.target.disabled = true;   
                    // get product from products
                    let cartItem = {...Storage.getProduct(id), amount:1};
                    // add product to the cart
                    cart.push(cartItem);
                    // save cart in local storage
                    Storage.saveCart(cart); 
                    // set cart values
                    this.setCartValue(cart);
                    // display cart item
                    this.displayCart(cart);
                    // show the cart
                    this.toggleCart();
                })
            }
        })
    }

    setCartValue(cart){
        let tempTotal = 0;
        let itemsTotal = 0;

        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    displayCart(cart){
        let results = '';
        
        cart.forEach(item => {
            results += `
                <div class="cart-item">
                    <img src="${item.image}" alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
                </div>
            `;
        });
        cartContent.innerHTML = results;
    }

    toggleCart(){
        cartOverlay.classList.toggle("transparentBcg");
        cartDOM.classList.toggle("showCart");
    }

    cartLogic(){
        clearCartBtn.addEventListener('click', this.clearCart.bind(this));
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                this.removeItem(id);
                cartContent.removeChild(removeItem.parentElement.parentElement);
            }
            else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = event.target.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValue(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(event.target.classList.contains('fa-chevron-down')){
                let subAmount = event.target;
                let id = event.target.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                if(tempItem.amount === 1){
                    this.removeItem(id);
                    cartContent.removeChild(subAmount.parentElement.parentElement);
                }else{
                    tempItem.amount -= 1
                    Storage.saveCart(cart);
                    this.setCartValue(cart);
                    subAmount.previousElementSibling.innerText = tempItem.amount;
                }
            }
        })
    }

    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.toggleCart();
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValue(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
    }

    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

//local storage
class Storage {
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id){
        let product = JSON.parse(localStorage.getItem("products"));
        return product.find(product => product.id === id);
    }

    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    //Get all products

    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
    });
    if(cart.length !== 0){
        ui.displayCart(cart);
        ui.setCartValue(cart);
    }
    ui.cartLogic();
    cartBtn.addEventListener("click", ui.toggleCart);
    closeCartBtn.addEventListener("click", ui.toggleCart);
    document.querySelector(".banner-btn").addEventListener("click", event => {
        document.querySelector("#products-center").scrollIntoView({behavior:"smooth"});
    })
})