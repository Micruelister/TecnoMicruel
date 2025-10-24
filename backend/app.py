# =================================================================
# FILE: app.py (CORRECT INITIALIZATION ORDER)
# =================================================================
import os
import re
import uuid
from functools import wraps

from dotenv import load_dotenv
from flask import (Flask, jsonify, request, session, make_response)
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from sqlalchemy import or_
from werkzeug.utils import secure_filename
import stripe
from flask_session import Session
from flask_migrate import Migrate

# --- Import db object and models ---
from models import db, Product, ProductImage, User, Order, Address, OrderProduct

# --- App Initialization and Configuration ---
app = Flask(__name__, static_folder='../static')
load_dotenv() # Load environment variables from .env

# --- Primary App Configurations ---
app.config.update(
    # Secret key for session signing
    SECRET_KEY=os.getenv('SECRET_KEY'),
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL') or os.getenv('SQLALCHEMY_DATABASE_URI'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,

    # File Uploads
    UPLOAD_FOLDER=os.path.join(app.root_path, '..', 'frontend/public/uploads/products')
)

# --- Session Configuration (DATABASE-BACKED) ---
# This tells Flask-Session to use our SQLAlchemy database
app.config.update(
    SESSION_TYPE='sqlalchemy',
    SESSION_SQLALCHEMY=db, # Use the db object initialized below
    SESSION_SQLALCHEMY_TABLE='sessions',
    SESSION_PERMANENT=False,
    SESSION_USE_SIGNER=True,
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SECURE=True
)

# --- Stripe Configuration ---
stripe.api_key = os.getenv('STRIPE_API_KEY')

# --- Extensions Initialization ---
# Initialize extensions AFTER the app and config are fully set up
db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
Session(app) # Initialize Flask-Session

# --- CORS Configuration ---
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
origins = [FRONTEND_URL, "https://tecnomicruelgit-14777933-c1adb.web.app"]
if GITPOD_WORKSPACE_URL := os.getenv('GITPOD_WORKSPACE_URL'):
    origins.append(re.sub(r'https://5000-', 'https://5173-', GITPOD_WORKSPACE_URL))
if CLOUD_WORKSTATIONS_URL := os.getenv('WEB_HOST'):
    origins.append(re.sub(r':\d+', ':5173', CLOUD_WORKSTATIONS_URL))

CORS(app, origins=origins, supports_credentials=True)


# =================================================================
# GLOBAL CORS PREFLIGHT (OPTIONS) HANDLER
# =================================================================
@app.before_request
def handle_preflight_requests():
    if request.method.upper() == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, X-CSRF-TOKEN")
        return response, 200

# =================================================================
# DIAGNOSTIC HEALTH CHECK
# =================================================================
@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "message": "Backend is running!"}), 200

# =================================================================
# DECORATORS
# =================================================================
def api_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"message": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def api_admin_required(f):
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
    if not address: return {}
    return {
        "id": address.id, "fullName": address.full_name, "streetAddress": address.street_address,
        "apartmentSuite": address.apartment_suite, "city": address.city, "postalCode": address.postal_code,
        "country": address.country, "phoneNumber": address.phone_number
    }

# =================================================================
# API ROUTES
# =================================================================

# --- Auth API ---
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.get_json()
    if not all(data.get(k) for k in ['username', 'email', 'password']):
        return jsonify({"message": "Username, email, and password are required"}), 400
    
    if User.query.filter(or_(User.username == data['username'], User.email == data['email'])).first():
        return jsonify({"message": "Username or email already exists"}), 409
        
    new_user = User(
        username=data['username'], email=data['email'],
        password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully!"}), 201

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    if not all(data.get(k) for k in ['email', 'password']):
        return jsonify({"message": "Email/Username and password are required"}), 400

    user = User.query.filter(or_(User.username == data['email'], User.email == data['email'])).first()
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        # Use standard session assignment
        session['user_id'] = user.id
        session['is_admin'] = user.is_admin
        return jsonify({
            "message": "Login successful!",
            "user": {"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin, "phoneNumber": user.phone_number}
        }), 200
    
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({"message": "Logout successful"}), 200

# --- User Profile API ---
@app.route('/api/my-orders', methods=['GET'])
@api_login_required
def get_my_orders():
    user_id = session['user_id']
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.order_date.desc()).all()
    
    orders_list = []
    for order in orders:
        products_list = []
        for op in order.products:
            product_info = {
                'id': op.product.id,
                'name': op.product.name,
                'price': op.price_at_purchase,
                'quantity': op.quantity
            }
            products_list.append(product_info)
            
        order_data = {
            'id': order.id,
            'orderDate': order.order_date.isoformat(),
            'totalAmount': order.total_amount,
            'status': order.status,
            'products': products_list
        }
        orders_list.append(order_data)
        
    return jsonify(orders_list), 200

@app.route('/api/user/addresses', methods=['GET'])
@api_login_required
def get_user_addresses():
    user_id = session['user_id']
    addresses = Address.query.filter_by(user_id=user_id).all()
    addresses_list = [address_to_dict(addr) for addr in addresses]
    return jsonify(addresses_list), 200

# --- Product & Brand API ---
@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'GET':
        query = Product.query
        if search_term := request.args.get('search'):
            query = query.filter(Product.name.ilike(f"%{search_term}%"))
        if (brand_filter := request.args.get('brand')) and brand_filter != 'All':
            query = query.filter_by(brand=brand_filter)
        products = query.order_by(Product.name).all()
        base_url = request.host_url.replace("http://", "https://")
        products_list = [
            {
                'id': p.id, 'name': p.name, 'price': p.price, 'stock': p.stock, 'description': p.description, 'brand': p.brand,
                'imageUrls': [f"{base_url}static/uploads/products/{image.filename}" for image in p.images],
                'thumbnailUrl': f"{base_url}static/uploads/products/{p.images[0].filename}" if p.images else f'{base_url}placeholder.svg'
            } for p in products
        ]
        return jsonify(products_list)

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
    brands = [brand[0] for brand in db.session.query(Product.brand).filter(Product.brand.isnot(None)).distinct().all()]
    return jsonify(brands)

@app.route('/api/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_specific_product(product_id):
    product = Product.query.get_or_404(product_id)
    if request.method == 'GET':
        base_url = request.host_url.replace("http://", "https://")
        return jsonify({
            'id': product.id, 'name': product.name, 'price': product.price, 'stock': product.stock, 'description': product.description, 'brand': product.brand,
            'imageUrls': [f"{base_url}static/uploads/products/{image.filename}" for image in product.images],
            'thumbnailUrl': f"{base_url}static/uploads/products/{p.images[0].filename}" if p.images else f'{base_url}placeholder.svg'
        })
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
# =================================================================
# SERVER STARTUP
# =================================================================
if __name__ == '__main__':
    # Use the PORT environment variable provided by Cloud Run, default to 5000 for local development
    port = int(os.environ.get("PORT", 5000))
    # Bind to 0.0.0.0 to be accessible from outside the container
    app.run(debug=True, host="0.0.0.0", port=port)
