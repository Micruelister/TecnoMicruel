# =================================================================
# FILE: app.py (Refactored with Pythonic Style & Address Book)
# =================================================================
import os
import re
import uuid
from functools import wraps

from dotenv import load_dotenv
from flask import (Flask, jsonify, request, session)
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from sqlalchemy import or_
from werkzeug.utils import secure_filename
import stripe
from flask_session import Session
from flask_migrate import Migrate
from werkzeug.middleware.proxy_fix import ProxyFix

# --- Import db object and models ---
from models import db, Product, ProductImage, User, Order, Address, OrderProduct

# --- App Initialization ---
app = Flask(__name__, static_folder='../static')
load_dotenv()

# --- Configuration ---
# Standard Flask and extension configs
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
app.config.update(
    SECRET_KEY=os.getenv('SECRET_KEY'),
    SESSION_TYPE='filesystem',
    SESSION_PERMANENT=False,
    SESSION_USE_SIGNER=True,
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SECURE=True,
    SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL') or os.getenv('SQLALCHEMY_DATABASE_URI'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    UPLOAD_FOLDER=os.path.join(app.root_path, '..', 'frontend/public/uploads/products')
)
stripe.api_key = os.getenv('STRIPE_API_KEY')

# --- CORS Configuration ---
# Build the list of allowed origins for CORS
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
origins = [FRONTEND_URL, "https://tecnomicruelgit-14777933-c1adb.web.app"]
if GITPOD_WORKSPACE_URL := os.getenv('GITPOD_WORKSPACE_URL'):
    origins.append(re.sub(r'https://5000-', 'https://5173-', GITPOD_WORKSPACE_URL))
if CLOUD_WORKSTATIONS_URL := os.getenv('WEB_HOST'):
    origins.append(re.sub(r':\d+', ':5173', CLOUD_WORKSTATIONS_URL))

# --- Extensions Initialization ---
Session(app)
CORS(app, origins=origins, supports_credentials=True)
bcrypt = Bcrypt(app)
db.init_app(app)
migrate = Migrate(app, db)

# =================================================================
# REQUEST LOGGING FOR DEBUGGING
# =================================================================
@app.before_request
def log_all_request_info():
    """A decorator to automatically log details of every incoming request."""
    # Using print() is reliable for capturing logs in Google Cloud Run.
    print(f"--- NEW REQUEST INCOMING ---")
    print(f"PATH: {request.path}")
    print(f"METHOD: {request.method}")
    print("HEADERS:")
    for header, value in request.headers.items():
        print(f"  {header}: {value}")
    print("--- END OF REQUEST DETAILS ---")

# =================================================================
# DIAGNOSTIC HEALTH CHECK
# =================================================================
@app.route('/api/health')
def health_check():
    """A simple health check endpoint to verify deployment."""
    return jsonify({"status": "ok", "message": "Backend is running!"}), 200

# =================================================================
# DECORATORS
# =================================================================
def api_login_required(f):
    """Decorator to ensure a user is logged in for an API endpoint."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"message": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def api_admin_required(f):
    """Decorator to ensure a user has admin privileges."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"message": "Authentication required"}), 401
        if not session.get('is_admin'):
            return jsonify({"message": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

# =================================================================
# HELPER FUNCTIONS
# =================================================================
def address_to_dict(address: Address) -> dict:
    """Converts an Address SQLAlchemy object to a dictionary."""
    if not address:
        return {}
    return {
        "id": address.id,
        "fullName": address.full_name,
        "streetAddress": address.street_address,
        "apartmentSuite": address.apartment_suite,
        "city": address.city,
        "postalCode": address.postal_code,
        "country": address.country,
        "phoneNumber": address.phone_number
    }

# =================================================================
# API ROUTES
# =================================================================

# --- Product & Brand API ---
@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    """Handles GET for all products and POST for creating a new product."""
    if request.method == 'GET':
        try:
            query = Product.query
            if search_term := request.args.get('search'):
                query = query.filter(Product.name.ilike(f"%{search_term}%"))
            if (brand_filter := request.args.get('brand')) and brand_filter != 'All':
                query = query.filter_by(brand=brand_filter)

            products = query.order_by(Product.name).all()
            base_url = request.host_url.replace("http://", "https://")

            products_list = [
                {
                    'id': p.id, 'name': p.name, 'price': p.price, 'stock': p.stock,
                    'description': p.description, 'brand': p.brand,
                    'imageUrls': [f"{base_url}static/uploads/products/{image.filename}" for image in p.images],
                    'thumbnailUrl': f"{base_url}static/uploads/products/{p.images[0].filename}" if p.images else f'{base_url}placeholder.svg'
                } for p in products
            ]
            return jsonify(products_list)
        except Exception as e:
            print(f"--- ERROR in GET /api/products: {e} ---")
            return jsonify({"error": "An error occurred fetching products"}), 500

    if request.method == 'POST':
        if 'user_id' not in session or not session.get('is_admin'):
             return jsonify({"message": "Admin access required"}), 403
        if 'name' not in request.form or 'price' not in request.form or 'stock' not in request.form:
            return jsonify({"message": "Name, price, and stock are required."}), 400
        
        new_product = Product(
            name=request.form['name'], price=float(request.form['price']), stock=int(request.form['stock']),
            description=request.form.get('description', ''), brand=request.form.get('brand', '')
        )
        db.session.add(new_product)
        db.session.flush()

        for file in request.files.getlist('images'):
            if file and file.filename != '':
                unique_filename = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1].lower()}"
                filename = secure_filename(unique_filename)
                upload_path = app.config['UPLOAD_FOLDER']
                os.makedirs(upload_path, exist_ok=True)
                file.save(os.path.join(upload_path, filename))
                db.session.add(ProductImage(filename=filename, product_id=new_product.id))
        
        db.session.commit()
        return jsonify({"message": "Product created successfully!", "productId": new_product.id}), 201

@app.route('/api/brands', methods=['GET'])
def get_brands():
    """Returns a unique list of all product brands."""
    try:
        brands = [brand[0] for brand in db.session.query(Product.brand).filter(Product.brand.isnot(None)).distinct().all()]
        return jsonify(brands)
    except Exception as e:
        print(f"--- ERROR in /api/brands: {e} ---")
        return jsonify({"error": "An error occurred fetching brands"}), 500

@app.route('/api/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_specific_product(product_id):
    """Handles GET, PUT, and DELETE for a single product."""
    product = Product.query.get_or_404(product_id)
    
    if request.method == 'GET':
        base_url = request.host_url.replace("http://", "https://")
        return jsonify({
            'id': product.id, 'name': product.name, 'price': product.price, 'stock': product.stock,
            'description': product.description, 'brand': product.brand,
            'imageUrls': [f"{base_url}static/uploads/products/{image.filename}" for image in product.images],
            'thumbnailUrl': f"{base_url}static/uploads/products/{product.images[0].filename}" if product.images else f'{base_url}placeholder.svg'
        })

    # Admin check for PUT and DELETE
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({"message": "Admin access required"}), 403

    if request.method == 'PUT':
        product.name = request.form.get('name', product.name)
        product.price = float(request.form.get('price', product.price))
        product.stock = int(request.form.get('stock', product.stock))
        product.description = request.form.get('description', product.description)
        product.brand = request.form.get('brand', product.brand)

        for file in request.files.getlist('images'):
            if file and file.filename != '':
                unique_filename = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1].lower()}"
                filename = secure_filename(unique_filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                db.session.add(ProductImage(filename=filename, product_id=product.id))
        
        db.session.commit()
        return jsonify({"message": f"Product '{product.name}' updated successfully"}), 200

    if request.method == 'DELETE':
        for image in product.images:
            try:
                os.remove(os.path.join(app.config['UPLOAD_FOLDER'], image.filename))
            except OSError as e:
                print(f"Error deleting image file: {e}")
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": f"Product '{product.name}' deleted successfully"}), 200

# --- Auth API ---
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    if not all(data.get(k) for k in ['username', 'email', 'password']):
        return jsonify({"message": "Username, email, and password are required"}), 400
    
    if User.query.filter(or_(User.username == data['username'], User.email == data['email'])).first():
        return jsonify({"message": "Username or email already exists"}), 409
        
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully!"}), 201

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    if not all(data.get(k) for k in ['email', 'password']): # 'email' field used for both username/email
        return jsonify({"message": "Email/Username and password are required"}), 400

    user = User.query.filter(or_(User.username == data['email'], User.email == data['email'])).first()
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        session.update(user_id=user.id, is_admin=user.is_admin)
        session.modified = True
        return jsonify({
            "message": "Login successful!",
            "user": {"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin, "phoneNumber": user.phone_number}
        }), 200
    
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({"message": "Logout successful"}), 200

# --- Checkout & Order API ---
@app.route('/api/create-checkout-session', methods=['POST'])
@api_login_required
def create_checkout_session():
    data = request.get_json()
    if not (cart_items := data.get('cartItems')) or not (shipping_address := data.get('shippingAddress')):
        return jsonify({"message": "Cart items and shipping address are required"}), 400

    session['shipping_address'] = shipping_address
    YOUR_FRONTEND_DOMAIN = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    
    line_items = [
        {
            'price_data': {
                'currency': 'usd',
                'product_data': {'name': item['name']},
                'unit_amount': int(item['price'] * 100)
            },
            'quantity': item['quantity']
        } for item in cart_items
    ]
    
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'], line_items=line_items, mode='payment',
            success_url=f"{YOUR_FRONTEND_DOMAIN}/order/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{YOUR_FRONTEND_DOMAIN}/order/cancel")
        return jsonify({'url': checkout_session.url})
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/order/verify', methods=['POST'])
@api_login_required
def verify_order():
    data = request.get_json()
    user_id = session.get('user_id')
    if not (session_id := data.get('sessionId')) or not (shipping_address_data := session.get('shipping_address')):
        return jsonify({"message": "Session ID or shipping data is missing"}), 400

    try:
        checkout_session = stripe.checkout.Session.retrieve(session_id, expand=["line_items.data.price.product"])
        if checkout_session.payment_status != "paid":
            return jsonify({"message": "Payment not successful"}), 402

        # Find or create the address, linking it to the user
        address = Address.query.filter_by(
            user_id=user_id,
            street_address=shipping_address_data.get('streetAddress'),
            city=shipping_address_data.get('city'),
            postal_code=shipping_address_data.get('postalCode'),
            country=shipping_address_data.get('country')
        ).first()

        if not address:
            address = Address(user_id=user_id, **shipping_address_data)
            db.session.add(address)
            db.session.flush() # Use flush to get address.id before commit

        # Create the order and link it to the address
        new_order = Order(user_id=user_id, total=checkout_session.amount_total / 100.0, address_id=address.id)
        db.session.add(new_order)
        
        # Update stock and create order-product links
        for item in checkout_session.line_items.data:
            product = Product.query.filter_by(name=item.price.product.name).first()
            if product:
                db.session.add(OrderProduct(order=new_order, product_id=product.id, quantity=item.quantity, unit_price=item.price.unit_amount / 100.0))
                product.stock -= item.quantity
        
        # Update user's phone number if not already set
        user = User.query.get(user_id)
        if user and not user.phone_number:
            user.phone_number = shipping_address_data.get('phoneNumber')

        db.session.commit()
        session.pop('shipping_address', None)
        return jsonify({"message": "Purchase verified and order saved"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"--- ERROR in /api/order/verify: {e} ---")
        return jsonify(error=str(e)), 500

# --- User Account & Address Book API ---
@app.route('/api/my-orders', methods=['GET'])
@api_login_required
def get_my_orders():
    orders = Order.query.filter_by(user_id=session['user_id']).order_by(Order.date.desc()).all()
    orders_list = [
        {
            'id': order.id,
            'date': order.date.strftime('%Y-%m-%d %H:%M'),
            'total': order.total,
            'shippingInfo': address_to_dict(order.address),
            'products': [
                {'name': item.product.name, 'quantity': item.quantity, 'unit_price': item.unit_price}
                for item in order.products
            ]
        } for order in orders
    ]
    return jsonify(orders_list)

@app.route('/api/user/profile', methods=['GET', 'PUT'])
@api_login_required
def handle_user_profile():
    user = User.query.get_or_404(session['user_id'])
    
    if request.method == 'GET':
        return jsonify({"username": user.username, "email": user.email, "phoneNumber": user.phone_number})

    if request.method == 'PUT':
        data = request.get_json()
        if (new_username := data.get('username')) and new_username != user.username and User.query.filter_by(username=new_username).first():
            return jsonify({"message": "Username already taken"}), 409
        if (new_email := data.get('email')) and new_email != user.email and User.query.filter_by(email=new_email).first():
            return jsonify({"message": "Email already registered"}), 409
        
        user.username = new_username or user.username
        user.email = new_email or user.email
        user.phone_number = data.get('phoneNumber', user.phone_number)
        db.session.commit()
        
        return jsonify({
            "message": "Profile updated successfully!",
            "user": {"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin, "phoneNumber": user.phone_number}
        })

@app.route('/api/user/change-password', methods=['POST'])
@api_login_required
def change_password():
    user = User.query.get_or_404(session['user_id'])
    data = request.get_json()
    
    if not all(data.get(k) for k in ['currentPassword', 'newPassword', 'confirmPassword']):
        return jsonify({"message": "All password fields are required"}), 400
    if not bcrypt.check_password_hash(user.password_hash, data['currentPassword']):
        return jsonify({"message": "Incorrect current password"}), 403
    if data['newPassword'] != data['confirmPassword']:
        return jsonify({"message": "New passwords do not match"}), 400

    user.password_hash = bcrypt.generate_password_hash(data['newPassword']).decode('utf-8')
    db.session.commit()
    return jsonify({"message": "Password updated successfully!"}), 200

@app.route('/api/user/addresses', methods=['GET', 'POST'])
@api_login_required
def handle_addresses():
    user_id = session['user_id']
    if request.method == 'GET':
        addresses = Address.query.filter_by(user_id=user_id).order_by(Address.id.desc()).all()
        return jsonify([address_to_dict(addr) for addr in addresses])

    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({"message": "Request body cannot be empty"}), 400
        
        new_address = Address(user_id=user_id, **data)
        db.session.add(new_address)
        db.session.commit()
        return jsonify({"message": "Address added successfully", "address": address_to_dict(new_address)}), 201

@app.route('/api/user/addresses/<int:address_id>', methods=['PUT', 'DELETE'])
@api_login_required
def handle_specific_address(address_id):
    address = Address.query.filter_by(id=address_id, user_id=session['user_id']).first_or_404()

    if request.method == 'PUT':
        data = request.get_json()
        for key, value in data.items():
            if hasattr(address, key):
                setattr(address, key, value)
        db.session.commit()
        return jsonify({"message": "Address updated successfully", "address": address_to_dict(address)})

    if request.method == 'DELETE':
        if Order.query.filter_by(address_id=address_id).first():
            return jsonify({"message": "Cannot delete address linked to past orders."}), 403
        
        db.session.delete(address)
        db.session.commit()
        return jsonify({"message": "Address deleted successfully"})

# --- Admin Order Management ---
@app.route('/api/admin/orders', methods=['GET'])
@api_admin_required
def get_all_orders():
    orders = Order.query.order_by(Order.date.desc()).all()
    orders_list = [
        {
            'id': order.id,
            'date': order.date.strftime('%Y-%m-%d %H:%M'),
            'total': order.total,
            'customer_name': order.user.username if order.user else 'Unknown',
            'shipping_info': address_to_dict(order.address),
            'products': [
                {'name': item.product.name, 'quantity': item.quantity, 'unit_price': item.unit_price}
                for item in order.products
            ]
        } for order in orders
    ]
    return jsonify(orders_list)

# =================================================================
# SERVER STARTUP
# =================================================================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
