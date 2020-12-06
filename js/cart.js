(function() {
	// получаем дом элемент корзины
	const cartDOMElement = document.querySelector('.js-cart');
	//если корзины нет то скрипт не выполняется
	if (!cartDOMElement) {
		return;
	}
	// получаем из локалстораж корзину и если нет ее создаем пустой объект
	const cart = JSON.parse(localStorage.getItem('cart')) || {};
	//Всего элементов в корзине
	const cartItemsCounterDOMElement = document.querySelector('.js-cart-total-count-items');
	// общая стоимость товаров в корзине
	const cartTotalPriceDOMElement = document.querySelector('.js-cart-total-price');
	// скрытое поле показывающее общую сумму в корзине( для отправки формы)
	const cartTotalPriceInputDOMElement = document.querySelector('.js-cart-total-price-input');
	// обертка корзины
	const cartWrapperDOMElement = document.querySelector('.js-cart-wrapper');
	
	// рендерим товар в корзине(деструктуризацией разбиваем объект на элементы для упрощения работы)
	const renderCartItem = ({ id, name, src, price, quantity }) => {
		// создаем див для элемента в корзине
		const cartItemDOMElement = document.createElement('div'); 
	 // шаблон продукта в корзине
		const cartItemTemplate = `
			<div class="cart-item cart__item">
				<div class="cart-item__main">
					<div class="cart-item__start">
						<button class="cart-item__btn cart-item__btn--remove js-btn-cart-item-remove" type="button"></button>
					</div>
					<div class="cart-item__img-wrapper">
						<img class="cart-item__img" src="${src}" alt="">
					</div>
					<div class="cart-item__content">
						<h3 class="cart-item__title">${name}</h3>
						<input type="hidden" name="${id}-Товар" value="${name}">  
						<input class="js-cart-input-quantity" type="hidden" name="${id}-Количество" value="${quantity}">
						<input class="js-cart-input-price" type="hidden" name="${id}-Цена" value="${price * quantity}">
					</div>
				</div>
				<div class="cart-item__end">
					<div class="cart-item__actions">
						<button class="cart-item__btn js-btn-product-decrease-quantity" type="button">-</button>
						<span class="cart-item__quantity js-cart-item-quantity">${quantity}</span>
						<button class="cart-item__btn js-btn-product-increase-quantity" type="button">+</button>
					</div>
					<p class="cart-item__price"><span class="js-cart-item-price">${price * quantity}</span> ₽</p>
				</div>
			</div>
			`;
		//вставляем в созданный див и добавляем аттрибуты из полученного товара
		cartItemDOMElement.innerHTML = cartItemTemplate;
		cartItemDOMElement.setAttribute('data-product-id', id);  
		cartItemDOMElement.classList.add('js-cart-item');
		// добавляем элемент в корзину
		cartDOMElement.appendChild(cartItemDOMElement);
	};

	const saveCart = () => {
		localStorage.setItem('cart', JSON.stringify(cart));
	};
	// обновляем общую стоимость товаров в корзине
	const updateCartTotalPrice = () => {

		const ids = Object.keys(cart);
		let totalPrice = 0;

		for (let i = 0; i <ids.length; i += 1) {
			const id = ids[i];
			totalPrice += cart[id].price * cart[id].quantity;
		}

		if (cartTotalPriceDOMElement) {
			cartTotalPriceDOMElement.textContent = totalPrice;
		}

		if (cartTotalPriceInputDOMElement) {
			cartTotalPriceInputDOMElement.value = totalPrice;
		}
	};

	// общее количество товаров в корзине
	const updateCartTotalItemsCounter = () => {
		const ids = Object.keys(cart);
		let totalQuantity = 0;

		for (let i = 0; i <ids.length; i += 1) {
			const id = ids[i];
			totalQuantity += cart[id].quantity;
		}
		if (cartItemsCounterDOMElement) {
			cartItemsCounterDOMElement.textContent = totalQuantity;
		}

		return totalQuantity;
	};

	// обновляем корзину
	const updateCart = () => {
		const totalQuantity = updateCartTotalItemsCounter();
		updateCartTotalPrice();
		saveCart();

		if (totalQuantity === 0) {
			cartWrapperDOMElement.classList.add('is-empty');
		} else {
			cartWrapperDOMElement.classList.remove('is-empty');
		}
	};
	// удаляем товар из корзины
	const deleteCartItem = (id) => {
		const cartItemDOMElement = cartDOMElement.querySelector(`[data-product-id="${id}"]`);
		// удаляем из дерева товар
		cartDOMElement.removeChild(cartItemDOMElement);
		// удаляем из объекта корзины товар
		delete cart[id];
		// обновляем корзину
		updateCart();
	};

	const addCartItem = (data) => {  // добавляем объект продукта в корзину
		const { id } = data;    // создаем объект товра (ключ равный айди)
		// если товар уже есть в корзине то прибавляев к нему
		if (cart[id]) {
			increaseQuantity(id);
			return;
		}

		cart[id] = data;
		renderCartItem(data);
		updateCart();
	};

	const updateQuantity = (id, quantity) => {
		const cartItemDOMElement = cartDOMElement.querySelector(`[data-product-id="${id}"]`);
		const cartItemQuantityDOMElement = cartItemDOMElement.querySelector('.js-cart-item-quantity');
		const cartItemPriceDOMElement = cartItemDOMElement.querySelector('.js-cart-item-price');
		const cartItemInputPriceDOMElement = cartItemDOMElement.querySelector('.js-cart-input-price');
		const cartItemInputQuantityDOMElement = cartItemDOMElement.querySelector('.js-cart-input-quantity');

		cart[id].quantity = quantity;
		cartItemQuantityDOMElement.textContent = quantity;
		cartItemPriceDOMElement.textContent = quantity * cart[id].price;
		cartItemInputPriceDOMElement.value = quantity * cart[id].price;
		cartItemInputQuantityDOMElement.value = quantity;

		updateCart();
	};
	// декремент в товаре в корзине
	const decreaseQuantity = (id) => {
		const newQuantity = cart[id].quantity - 1;
		if (newQuantity >= 1) {
			updateQuantity(id, newQuantity);
		}
	};
	// инкремент в товаре в корзине
	const increaseQuantity = (id) => {
		const newQuantity = cart[id].quantity + 1;  //прибавляем товар если его больше или равно 1
		updateQuantity(id, newQuantity);
	};

	const generateID = (string1, string2) => {   //генерируем айди(не нужно)
		const secondParam = string2 ? `-${string2}` : '';
		return `${string1}${secondParam}`.replace(/ /g, '-'); // регулярка для поиска всех пробелов
	};

	// получаем данные продукта и возвращаем объект
	const getProductData = (productDOMElement) => {
		// получаем данные продукта через дата атрибуты
		const name = productDOMElement.getAttribute('data-product-name');
		const price = productDOMElement.getAttribute('data-product-price');
		const src = productDOMElement.getAttribute('data-product-src');
		const quantity = 1; // количество по умолчанию один
		const id = productDOMElement.getAttribute('id');

		return { name, price, src, quantity, id };
	};

	// рендерим корзину 
	const renderCart = () => {
		const ids = Object.keys(cart);
		// перебираем содержимое корзины и рендерим
		ids.forEach((id) => renderCartItem(cart[id]));
	};
	// очищаем корзину после отправки
	const resetCart = () => {
		const ids = Object.keys(cart);
		ids.forEach((id) => deleteCartItem(cart[id].id));
	};

	// инициализируем корзину
	const cartInit = () => {
		renderCart();
		updateCart();

		document.addEventListener('reset-cart', resetCart);

		document.querySelector('body').addEventListener('click', (e) => {   
			const target = e.target;
			// обрабатываем клик по кнопке добавить в корзину
			if (target.classList.contains('js-btn-add-to-cart')) {
				e.preventDefault();

				// получаем родительский блок( сам товар)
				const productDOMElement = target.closest('.js-product');
				const data = getProductData(productDOMElement);
				addCartItem(data);
			}
			// обрабатываем кнопку удалить товар из корзины
			if (target.classList.contains('js-btn-cart-item-remove')) {
				e.preventDefault();
				const cartItemDOMElement = target.closest('.js-cart-item');
				const productID = cartItemDOMElement.getAttribute('data-product-id');
				deleteCartItem(productID);
			}
			// инкремент в корзине
			if (target.classList.contains('js-btn-product-increase-quantity')) {
				e.preventDefault();
				const cartItemDOMElement = target.closest('.js-cart-item');
				const productID = cartItemDOMElement.getAttribute('data-product-id');
				increaseQuantity(productID);
			}
			// декремент в корзине
			if (target.classList.contains('js-btn-product-decrease-quantity')) {
				e.preventDefault();
				const cartItemDOMElement = target.closest('.js-cart-item');
				const productID = cartItemDOMElement.getAttribute('data-product-id');
				decreaseQuantity(productID);
			}
			// кнопка очистить корзину
			if (target.classList.contains('clear-cart')) {
				e.preventDefault();
				resetCart();

			}
		});
	};
	const openCartBtn = document.querySelector('.cart-open-btn');
	const overlay = document.querySelector('.overlay');
	const modal = document.querySelector('.section-cart');
	openCartBtn.onclick = function(){
		overlay.classList.add('open');
		modal.classList.add('open');
	}
	overlay.onclick = function() {
		overlay.classList.remove('open');
		modal.classList.remove('open');
	}
	cartInit();
})();