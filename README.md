# Full-Stack E-commerce Project with Cloud Deployment

## 1. Project Overview

This is a complete and functional e-commerce application featuring a modern React frontend and a robust Flask backend. The project is designed for scalability and is deployed on Google Cloud Platform, utilizing services like Google Cloud Run for the backend, Firebase Hosting for the frontend, and Google Cloud SQL for the database.

The application offers a complete shopping experience, from a product catalog and shopping cart to a secure checkout process integrated with Stripe.

## 2. System Architecture

The project follows a microservices architecture, with a clear separation between the frontend and backend, allowing for independent development and deployment.

### 2.1. Frontend (React)

*   **Framework**: Built with **React** and **Vite**, ensuring fast performance and a modern development experience.
*   **Hosting**: Deployed on **Firebase Hosting**, providing a fast and secure Content Delivery Network (CDN) worldwide.
*   **Structure**:
    *   `src/components`: Reusable UI components (Navbar, Footer, ProductCard, etc.).
    *   `src/pages`: Components representing the different pages of the application (HomePage, CartPage, CheckoutPage, etc.).
    *   `src/context`: Global state management for the shopping cart (`CartContext`) and user authentication (`AuthContext`).
    *   `src/api`: A configured Axios instance (`axiosInstance`) for making secure calls to the backend API.
*   **Key Features**:
    *   **Protected Routing**: Separate routes for public users, authenticated users, and administrators, ensuring security and proper authorization.
    *   **Reusable Components**: The code is modular and easy to maintain thanks to a component-based structure.
    *   **Integration with External APIs**: Uses **OpenStreetMap** for address autocomplete and **Stripe** for payment processing.

### 2.2. Backend (Flask)

*   **Framework**: Developed in **Python** with **Flask**, a lightweight and powerful micro-framework.
*   **Hosting**: Containerized with **Docker** and deployed on **Google Cloud Run**, enabling automatic scaling and high availability.
*   **Structure**:
    *   `app.py`: The main application file containing Flask configuration, API routes, and business logic.
    *   `models.py`: Defines the database models using **SQLAlchemy**, which facilitates interaction with the database.
    *   `requirements.txt`: A list of all necessary Python dependencies for the project.
    *   `Procfile` and `Dockerfile`: Configuration files for cloud deployment.
*   **Key Features**:
    *   **RESTful API**: Provides endpoints for managing products, users, orders, and authentication.
    *   **Authentication and Authorization**: Implements a secure login system with sessions and decorators to protect specific routes.
    *   **Database Migrations**: Uses **Flask-Migrate** to manage changes to the database schema safely and controllably.

### 2.3. Database

*   **Service**: **Google Cloud SQL** with a **PostgreSQL** engine.
*   **ORM**: **SQLAlchemy** is used in the backend to map Python objects to database tables, simplifying queries and operations.
*   **Schema**: Includes tables for products, users, orders, and addresses, with well-defined relationships to ensure data integrity.

## 3. Current Status and Next Steps

The application is fully functional, but a key opportunity has been identified to improve scalability and user experience.

**Current Status:**
The current system creates a new address entry for each order, which leads to data duplication and requires users to enter their address with every purchase.

**Next Steps (Refactoring in Progress):**
A refactoring is underway to implement an **address book** feature for users.

1.  **Backend**:
    *   **Modify the `Address` model** to link it directly to the `User`, creating a one-to-many relationship.
    *   **Create new API endpoints** for users to manage (create, view, update, delete) their saved addresses.
    *   **Update the checkout logic** to allow users to select a saved address or add a new one.
2.  **Frontend**:
    *   **Add a section in "My Account"** for users to manage their address book.
    *   **Update the checkout page** to allow the selection of saved addresses, thereby improving the shopping experience.

## 4. Technologies Used

*   **Frontend**: React, Vite, JavaScript, CSS Modules, Axios
*   **Backend**: Python, Flask, SQLAlchemy, Gunicorn
*   **Database**: PostgreSQL
*   **Deployment**: Docker, Google Cloud Run, Firebase Hosting
*   **External APIs**: Stripe, OpenStreetMap

## 5. Local Setup and Development

(This section will be completed after the refactoring is finished to ensure the instructions are accurate).
