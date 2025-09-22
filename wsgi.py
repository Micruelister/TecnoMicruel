# wsgi.py en la raíz del proyecto

from backend.src.app import app

if __name__ == "__main__":
    app.run()