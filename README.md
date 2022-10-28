# Miriio - Red social.

Miriio es una pequeña red social y PWA para que los usuarios compartan las ideas
que desean. Puedes ver la aplicación [aquí](https://miriio.vercel.app/ 'aquí').

[![Miriio](https://res.cloudinary.com/dklpyhteh/image/upload/v1661742489/Portfolio/miriio_qn4y7e.png 'Miriio')](https://res.cloudinary.com/dklpyhteh/image/upload/v1661742489/Portfolio/miriio_qn4y7e.png 'Miriio')

## Frontend

El frontend de este sitio lo puedes ver en este
[repositorio](https://github.com/jonathangg03/social-media-frontend 'repositorio').

## Resumen

Esta es la API REST, que va a manejar todos los datos enviados por el frontend.
Vamos a almacenarlos en una Base de datos de MongoDB.

## Correr aplicación en local

- Debes clonar este repositorio.
- Abrir una terminal e ingresar a la carpeta creada.
- Instalar las dependencias con el comando "npm install".
- Renombrar el archivo ".env.example" por ".env". Colocar los valores a las
  variables de entorno, en este caso sería el puerto en el que correrá este
  servidor en local (3001, pero puede ser cualquiera), la URI de nuestra Base de
  datos, el host (localhost), el "secret" o contraseña para el codificado de
  algunos elementos.
- Crear una cuenta en Cloudinary, y llenar las variables de entorno
  correspondientes. Este es un servicio para almacenar imagenes.
- Iniciar el proyecto con el comando "npm run dev".
