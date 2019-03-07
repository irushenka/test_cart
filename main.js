
let productList = [
	{ id: 1, title: "Pizza Marinara", price: 100 },
	{ id: 2, title: "Pizza Margherita", price: 200 },
	{ id: 3, title: "Pizza Neapolitan", price: 300 },
	{ id: 4, title: "Pizza Calzone", price: 400 }
];

let couponList = [0.5, 0.75, 0.3];

class ProductsData extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			productList: [],
			total: 0,
			totalDiscount: 1,
			
			history: [],
			currentHistoryIndex: -1,
			
			appliedCoupon: false,
			couponValue: 0
		};
		
		let products = productList.map((product) => {
			return {
				...product,
				quantity: 0,
				discountPrice: product.price
			}
		});
		this.state.productList = products;
		this.state.couponValue = couponList[0];
		
		this.changeCoupon = this.changeCoupon.bind(this);
	}
	
	countTotal(products) {
		var total = 0;
		products.map(product => {
			total += product.discountPrice*product.quantity;
		});
		return total*this.state.totalDiscount;
	}
	
	add(product, saveHistory) {
		product.quantity += 1;
		const products = this.state.productList.map(items => {
			if (product.id != items.id) return items;
			return product;
		});
		this.setState({productList: products, total: this.countTotal(products) }, () => {
			if(saveHistory) {
				var addHistory = {
					type: "Add",
					product: product,
					coupon: null
				};
				this.addToHistory(addHistory);
			}
		});
	}
	
	substract(product, saveHistory) {
		product.quantity -= 1;
		const products = this.state.productList.map(items => {
			if (product.id != items.id) return items;
			return product;
		});
		
		this.setState({productList: products, total: this.countTotal(products) }, () => {
			if(saveHistory) {
				var substractHistory = {
					type: "Substract",
					product: product,
					coupon: null
				};
				this.addToHistory(substractHistory);
			}
		});
	}
	
	changeCoupon(e) {
		var value = e.target.value
		this.setState({ couponValue: value });
	}
	
	applyCouponToCart(couponValue, saveHistory) {
		var price = this.state.total*(1-couponValue);
		this.setState({ coupon: true, total: price, totalDiscount: couponValue, appliedCoupon: true }, () => {
			if(saveHistory) {
				var applyCouponToCartHistory = {
					type: "ApplyCouponToCart",
					product: null,
					coupon: couponValue
				}
				this.addToHistory(applyCouponToCartHistory);
			}
		});
	}
	
	cancelCouponToCart(couponValue, saveHistory) {
		var price = 0;
		this.state.productList.filter(product => product.quantity > 0).map(product => {
			price += product.quantity*product.price;
		});
		this.setState({ coupon: false, total: price, totalDiscount: 1, appliedCoupon: false}, () => {
			if(saveHistory) {
				var cancelCouponToCartHistory = {
					type: "CancelCouponToCart",
					product: null,
					coupon: couponValue
				}
				this.addToHistory(cancelCouponToCartHistory);
			}
		});
	}
	
	applyCouponToProduct(product, couponValue, saveHistory) {
		var price = 0;
		var quantity = 0;
		const products = this.state.productList.map(items => {
			if (product.id != items.id) return items;
			else {
				price = product.price*(1-couponValue);
				quantity = product.quantity;
				return { ...items, discountPrice: price };
			}
		});
		this.setState({ productList: products, total: this.countTotal(products), appliedCoupon: true}, () => {
			if(saveHistory) {
				var applyCouponToProduct = {
					type: "ApplyCouponToProduct",
					product: product,
					coupon: couponValue
				}
				this.addToHistory(applyCouponToProduct);
			}
		});
	}
	
	cancelCouponToProduct(product, couponValue, saveHistory) {
		var price = 0;
		var quantity = 0;
		const products = this.state.productList.map(items => {
			if (product.id != items.id) return items;
			else {
				price = product.discountPrice;
				quantity = product.quantity;
				return { ...items, discountPrice: product.price };
			}
		});
		
		this.setState({ productList: products, total: this.countTotal(products), appliedCoupon: false}, () => {
			if(saveHistory) {
				var cancelCouponToProduct = {
					type: "CancelCouponToProduct",
					product: product,
					coupon: couponValue
				}
				this.addToHistory(cancelCouponToProduct);
			}
		});
	}
	
	canUndo() {
		return this.state.currentHistoryIndex >= 0; 
	} 
	
	canRedo() {
		return this.state.history.length > 0 && this.state.currentHistoryIndex < this.state.history.length - 1; 
	}
	
	undo() {
		if(!this.canUndo())
			return;
		this.undoHistoryOperation(this.state.history[this.state.currentHistoryIndex]);
		this.state.currentHistoryIndex--;
	}
	
	redo() {
		if (!this.canRedo())
			return;
		this.state.currentHistoryIndex++;
		this.redoHistoryOperation(this.state.history[this.state.currentHistoryIndex]);
	}
	
	undoHistoryOperation(operation) {
		var product = operation.product;
		var coupon = operation.coupon;
		switch(operation.type) {
			case 'Add':
				this.substract(product, false);
				break;
			case 'Substract':
				this.add(product, false);
				break;
			case 'ApplyCouponToCart':
				this.cancelCouponToCart(coupon, false);
				break;
			case 'CancelCouponToCart':
				this.applyCouponToCart(coupon, false);
				break;
			case 'ApplyCouponToProduct':
				this.cancelCouponToProduct(product, coupon, false);
				break;
			case 'CancelCouponToProduct':
				this.applyCouponToProduct(product, coupon, false);
				break;
			default:
				break;		
		}
	}
	
	redoHistoryOperation(operation) {
		var product = operation.product;
		var coupon = operation.coupon;
		switch(operation.type) {
			case 'Add':
				this.add(product, false);
				break;
			case 'Substract':
				this.substract(product, false);
				break;
			case 'ApplyCouponToCart':
				this.applyCouponToCart(coupon, false);
				break;
			case 'CancelCouponToCart':
				this.cancelCouponToCart(coupon, false);
				break;
			case 'ApplyCouponToProduct':
				this.applyCouponToProduct(product, coupon, false);
				break;
			case 'CancelCouponToProduct':
				this.cancelCouponToProduct(product, coupon, false);
				break;
			default:
				break;		
		}
	}
	
	addToHistory(historyItem) {
		this.removeHistory();
		this.setState({
			history: this.state.history.concat([historyItem]), currentHistoryIndex: this.state.currentHistoryIndex+1
		});
		this.state.currentHistoryIndex++;
	}
	
	removeHistory() {
		var index = this.state.currentHistoryIndex + 1;
		if (index < this.state.history.length) {
			this.state.history.splice(index, this.state.history.length - index);
		}
	}
	
	render() {
		return (
			<div className="productsData">
				<div className="products">
					{this.state.productList.map((data, num) => (
						<div key={num} className="row">
							<div>
								<div className="productTitle">{data.title}: ${data.price}</div>
								<div>quantity: {data.quantity}</div>
							</div>
							<div>
								<button onClick={() => this.add(data, true)}>+1</button>
								<button onClick={() => this.substract(data, true)} disabled={data.quantity < 1}>-1</button>
							</div>
							<div>
								<button onClick={() => this.applyCouponToProduct(data, this.state.couponValue, true)} 
									disabled={this.state.appliedCoupon || data.quantity == 0}>Apply coupon</button>
								<button onClick={() => this.cancelCouponToProduct(data, this.state.couponValue, true)} 
									disabled={data.price==data.discountPrice}>Cancel coupon</button>
							</div>
						</div>
					))}
				</div>
				<div className="selectedProducts">
					<div className="header">
						<div className="title">
							<div>Total price: {this.state.total}</div>
						</div>
						<div className="historyOperation">
							<button onClick={() => this.undo()} disabled={!this.canUndo()}>Undo</button>
							<button onClick={() => this.redo()} disabled={!this.canRedo()}>Redo</button>
						</div>
						<div>
							<div>Select coupon (discount): </div>
							<select value={this.state.couponValue} onChange={this.changeCoupon} 
									disabled={this.state.appliedCoupon || this.state.productList.filter(product => product.quantity > 0).length == 0}>
								{couponList.map((data, num) => (
									<option key={num} value={data}>{data}</option>
								))}
							</select>
						</div>
						<div>
							<button onClick={() => this.applyCouponToCart(this.state.couponValue, true)} 
								disabled={this.state.appliedCoupon || this.state.totalDiscount!=1 || this.state.total==0}>Apply coupon to cart</button>
							<button onClick={() => this.cancelCouponToCart(this.state.couponValue, true)} 
								disabled={!this.state.appliedCoupon || this.state.totalDiscount==1}>Cancel coupon to cart</button>
						</div>
					</div>
					<div>
						{this.state.productList.filter(product => product.quantity > 0).length > 0 ? <div className="title"><div>Selected products:</div></div> : null}
						{this.state.productList.filter(product => product.quantity > 0).map((data, num) => (
							<div key={num} className="row">
								<div>
									<div className="productTitle">{data.title}: {data.discountPrice} (without discount {data.price})</div>
									<div>quantity: {data.quantity}</div>
									<div>total price: {data.quantity*data.discountPrice}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}
}

ReactDOM.render(<ProductsData />, document.getElementById("root"));



