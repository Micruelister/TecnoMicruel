# E-commerce Project: Frontend, Backend, and Cloud Deployment

## Project Overview

This is a full-stack e-commerce application with a React frontend, a Flask (Python) backend, and is configured for automated deployment on Google Cloud Platform.

### Core Technologies

*   **Frontend**: React (built with Vite), JavaScript (ES6+), CSS Modules.
*   **Backend**: Python 3.11, Flask, SQLAlchemy (for database interaction).
*   **Database**: Google Cloud SQL (PostgreSQL).
*   **Deployment**: Google Cloud Build & Google Cloud Run, triggered by `git push` to the `main` branch.
*   **CI/CD**: The project is configured with a Cloud Build trigger that automatically builds and deploys the backend service when changes are pushed to the GitHub repository.

## Current Project Status

The project is **almost fully functional** but is currently blocked by a **critical deployment issue** in the backend.

### Frontend (`/frontend`)

*   **Structure**: The frontend is a standard React application created with Vite. Key directories include `src/components`, `src/pages`, and `src/services`.
*   **Functionality**: Implements user registration, login, product catalog, shopping cart, and a checkout flow using Stripe and the Google Places API.
*   **Component-Based**: The code is well-structured with reusable components. For example, `frontend/src/components/forms/FormFields.jsx` provides a generic input field.
*   **API Keys**: The frontend correctly uses environment variables for sensitive keys (e.g., Google Places API). See `frontend/src/components/forms/GooglePlacesAutocomplete.jsx` for an example.
*   **State**: The frontend is considered stable and complete, pending the backend becoming fully operational.

### Backend (`/backend`)

*   **Structure**: A Flask application with a main `app.py`, a `models.py` for SQLAlchemy database models, and a `requirements.txt` for dependencies.
*   **Functionality**: Provides API endpoints for products, user authentication, order management, and Stripe integration. It is designed to connect to a Google Cloud SQL (PostgreSQL) instance.
*   **Dockerfile**: A `backend/Dockerfile` is included, which correctly containerizes the application for deployment. It copies the `requirements.txt` file, installs dependencies, and runs the application using `gunicorn`.
*   **Database Connection**: The code in `app.py` has been updated to correctly read the database connection string from an environment variable (`DATABASE_URL`). This part is believed to be correct.

---

## !! CRITICAL DEPLOYMENT ISSUE !!

**The backend service is currently FAILING TO DEPLOY.**

### The Problem

Every time a `git push` is made, the Google Cloud Build process fails. The logs consistently show the following error:

```
ModuleNotFoundError: No module named 'dotenv'
```

This error indicates that the `python-dotenv` package is not being installed during the build process.

### The Cause

The root cause is that the `backend/requirements.txt` file in the GitHub repository is **incorrect or outdated**. Although we have attempted to add `python-dotenv==1.0.1` and other missing dependencies (like `pg8000`) to this file locally, these changes are **not being correctly reflected in the repository after pushing**.

The Cloud Build process clones the repository directly from GitHub. If `backend/requirements.txt` is missing dependencies there, the build will fail, regardless of what the file looks like on a local machine.

We have been stuck in a loop where:
1.  We fix `backend/requirements.txt` locally.
2.  We `git push` the changes.
3.  The version of the file in the repository remains outdated.
4.  The build fails.

### **IMMEDIATE NEXT STEPS FOR THE NEW DEVELOPER**

Your first and most important task is to resolve this deployment blocker.

1.  **Verify `backend/requirements.txt` on GitHub**: Go to the project repository on GitHub.com and navigate to `backend/requirements.txt`. Check if `python-dotenv==1.0.1` and `pg8000==1.31.2` are present. They most likely are not.

2.  **Force an Update to the File**: You must ensure the correct version of this file gets into the repository. A robust way to do this is:
    a. Delete the file from your local repository: `git rm backend/requirements.txt`
    b. Commit the deletion: `git commit -m "Docs: Removing corrupt requirements file"`
    c. Re-create the `backend/requirements.txt` file locally with the correct content (provided below).
    d. Add, commit, and push the new file: `git add backend/requirements.txt`, `git commit -m "Fix: Recreating requirements file with all dependencies"`, and `git push`.

3.  **Correct `requirements.txt` Content**: The file should contain *at least* the following dependencies:
    ```
    Flask==3.0.3
    Flask-SQLAlchemy==3.1.1
    Flask-Migrate==4.0.7
    Flask-Bcrypt==1.0.1
    Flask-Cors==4.0.1
    Flask-Session==0.6.0
    gunicorn==23.0.0
    psycopg2-binary
    pg8000==1.31.2
    python-dotenv==1.0.1
    SQLAlchemy==2.0.31
    stripe==10.2.0
    Werkzeug==3.0.3
    greenlet==3.0.3
    itsdangerous==2.2.0
    Jinja2==3.1.4
    MarkupSafe==2.1.5
    blinker==1.8.2
    click==8.1.7
    ```

4.  **Monitor the Build**: After you successfully `git push` the corrected file, go to the Google Cloud Console, find the Cloud Build history, and monitor the new build. It should now pass the dependency installation step. Once the build succeeds, Cloud Run will deploy the new revision, and the API should become available.

Once the backend is successfully deployed, the project should be fully operational.
