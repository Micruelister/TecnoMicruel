# Usa una imagen oficial de Python como imagen base
FROM python:3.11-slim

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo de dependencias al directorio de trabajo
COPY requirements.txt .

# Instala las dependencias
# La opción --no-cache-dir reduce el tamaño de la imagen
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código de la aplicación al directorio de trabajo
COPY . .

# Expone el puerto en el que se ejecutará la aplicación (Gunicorn se vinculará a este puerto)
# La variable PORT es proporcionada automáticamente por Cloud Run.
EXPOSE $PORT

# Comando para ejecutar la aplicación cuando se inicie el contenedor
# Usa Gunicorn, un servidor WSGI de grado de producción.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 app:app
