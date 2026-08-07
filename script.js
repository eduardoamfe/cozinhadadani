class Cart {
    constructor() {
        this.items = [];
        this.selectedItem = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCartDisplay();
    }

    bindEvents() {
        // Modal de Expansão de Item
        document.getElementById('closeItemModal')?.addEventListener('click', () => this.closeItemModal());
        document.getElementById('addToCartBtn')?.addEventListener('click', () => this.addSelectedItemToCart());

        // Modal do Carrinho
        document.getElementById('cartButton')?.addEventListener('click', () => this.openCart());
        document.getElementById('closeCart')?.addEventListener('click', () => this.closeCart());
        document.getElementById('checkoutBtn')?.addEventListener('click', () => this.processOrder());

        // Pagamento em dinheiro / troco
        document.getElementById('paymentMethod')?.addEventListener('change', (e) => {
            const changeGroup = document.getElementById('changeGroup');
            if (e.target.value === 'dinheiro') {
                changeGroup.style.display = 'block';
            } else {
                changeGroup.style.display = 'none';
            }
        });

        document.getElementById('needChange')?.addEventListener('change', (e) => {
            document.getElementById('changeAmount').style.display = e.target.checked ? 'block' : 'none';
        });

        // Validação de formulário
        ['customerName', 'customerAddress', 'paymentMethod'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.validateForm());
            document.getElementById(id)?.addEventListener('change', () => this.validateForm());
        });
    }

    openItemModal(name, price, image, description) {
        this.selectedItem = { name, price, image, description };
        
        document.getElementById('modalTitle').textContent = name;
        document.getElementById('modalDescription').textContent = description;
        document.getElementById('modalPrice').textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
        document.getElementById('modalImage').src = image;
        document.getElementById('specialInstructions').value = '';

        document.getElementById('itemModal').classList.add('open');
    }

    closeItemModal() {
        document.getElementById('itemModal').classList.remove('open');
        this.selectedItem = null;
    }

    addSelectedItemToCart() {
        if (!this.selectedItem) return;

        const obs = document.getElementById('specialInstructions').value.trim();
        const existing = this.items.find(i => i.name === this.selectedItem.name && i.obs === obs);

        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({
                name: this.selectedItem.name,
                price: this.selectedItem.price,
                obs: obs,
                quantity: 1
            });
        }

        this.closeItemModal();
        this.updateCartDisplay();
    }

    updateQuantity(index, change) {
        this.items[index].quantity += change;
        if (this.items[index].quantity <= 0) {
            this.items.splice(index, 1);
        }
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        document.getElementById('cartCount').textContent = totalItems;
        document.getElementById('cartHeaderTotal').textContent = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;
        document.getElementById('cartTotal').textContent = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;

        const cartItemsContainer = document.getElementById('cartItems');
        const cartForm = document.getElementById('cartForm');

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-heart-broken"></i>
                    <p>Seu carrinho está vazio</p>
                    <small>Escolha um delicioso pudim para começar!</small>
                </div>
            `;
            cartForm.style.display = 'none';
        } else {
            cartItemsContainer.innerHTML = this.items.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        ${item.obs ? `<small style="color:#8c7878;">Obs: ${item.obs}</small>` : ''}
                        <div class="cart-item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="cart.updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
            `).join('');
            cartForm.style.display = 'block';
        }

        this.validateForm();
    }

    openCart() {
        document.getElementById('cartModal').classList.add('open');
    }

    closeCart() {
        document.getElementById('cartModal').classList.remove('open');
    }

    validateForm() {
        const name = document.getElementById('customerName')?.value.trim();
        const address = document.getElementById('customerAddress')?.value.trim();
        const payment = document.getElementById('paymentMethod')?.value;
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (checkoutBtn) {
            checkoutBtn.disabled = !(name && address && payment && this.items.length > 0);
        }
    }

    processOrder() {
        const name = document.getElementById('customerName').value.trim();
        const address = document.getElementById('customerAddress').value.trim();
        const payment = document.getElementById('paymentMethod').value;
        const needChange = document.getElementById('needChange')?.checked;
        const changeVal = document.getElementById('changeValue')?.value;
        const notes = document.getElementById('orderNotes')?.value.trim();

        let message = `🍮 *PEDIDO - COZINHA DA DANI* 💕\n\n`;
        message += `*ITENS:* \n`;

        this.items.forEach(item => {
            message += `• ${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
            if (item.obs) message += `   _Obs: ${item.obs}_\n`;
        });

        const totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\n*TOTAL:* R$ ${totalAmount.toFixed(2).replace('.', ',')}\n\n`;

        message += `*DADOS DO CLIENTE:*\n`;
        message += `• Nome: ${name}\n`;
        message += `• Endereço: ${address}\n`;
        message += `• Pagamento: ${payment.toUpperCase()}\n`;

        if (payment === 'dinheiro' && needChange) {
            message += `• Troco para: R$ ${parseFloat(changeVal || 0).toFixed(2).replace('.', ',')}\n`;
        }

        if (notes) {
            message += `\n*Observações gerais:* ${notes}`;
        }

        const phone = '5543988423648'; // Número da Cozinha da Dani
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        document.getElementById('successModal').classList.add('open');

        setTimeout(() => {
            window.open(url, '_blank');
            this.items = [];
            this.updateCartDisplay();
            this.closeCart();
            document.getElementById('successModal').classList.remove('open');
        }, 1500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cart = new Cart();
});