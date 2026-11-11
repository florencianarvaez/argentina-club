# 🇦🇷 Argentina Club

### AI Driven E-Commerce | Proyecto Full Stack

**Argentina Club** es una aplicación web de comercio electrónico desarrollada como proyecto académico para **Patagonix Tech**, en el marco de la formación Full Stack de Henry.

La plataforma permite explorar productos argentinos, gestionar un carrito de compras, realizar pedidos y consultar su historial. También incorpora un panel de administración para gestionar productos y pedidos.

**Aplicación desplegada:** https://argentina-club.vercel.app/

---

## 1. Objetivo del proyecto

Desarrollar una aplicación de comercio electrónico que integre autenticación, persistencia de datos, gestión de productos, procesamiento seguro de pedidos y almacenamiento de imágenes en la nube.

El proyecto busca aplicar buenas prácticas de desarrollo, arquitectura modular, seguridad, pruebas automatizadas y uso responsable de herramientas de inteligencia artificial.

## 2. Tecnologías utilizadas

| Tecnología | Aplicación |
|---|---|
| React 18 | Construcción de interfaces |
| TypeScript | Tipado estático |
| Vite | Entorno de desarrollo y compilación |
| React Router | Navegación |
| Tailwind CSS | Diseño responsive |
| Context API | Gestión de estado global |
| useReducer | Gestión del carrito |
| Firebase Authentication | Autenticación de usuarios |
| Cloud Firestore | Base de datos |
| Firebase Admin SDK | Operaciones seguras del servidor |
| AWS S3 | Almacenamiento de imágenes |
| Vercel | Despliegue y funciones serverless |
| Vitest | Pruebas automatizadas |
| React Testing Library | Pruebas de componentes y hooks |

## 3. Funcionalidades

### Clientes

- Registro e inicio de sesión.
- Autenticación mediante correo electrónico y Google.
- Persistencia de la sesión.
- Visualización del catálogo de productos.
- Consulta de información y precios.
- Carrito de compras con actualización de cantidades.
- Persistencia local del carrito.
- Confirmación de pedidos.
- Consulta del historial de compras.
- Visualización de productos, cantidades, importes y estados de cada pedido.

### Administradores

- Acceso a funcionalidades según el rol del usuario.
- Creación, edición y gestión de productos.
- Administración del stock.
- Carga de imágenes mediante AWS S3.
- Consulta de pedidos.
- Filtrado de pedidos por estado.
- Actualización del estado de los pedidos.

Los estados contemplados incluyen `pending`, `processing`, `completed` y `cancelled`. La implementación también admite `shipped` y `delivered`.

## 4. Arquitectura del proyecto

La aplicación utiliza una arquitectura modular que separa las responsabilidades de presentación, estado, servicios y operaciones de servidor.

```text
src/
├── components/
├── contexts/
├── hooks/
├── pages/
├── services/
└── types/

api/
├── create-order.ts
├── upload-url.ts
└── image-url.ts
```

### Frontend

React y TypeScript permiten construir una interfaz organizada en componentes reutilizables.

**Context API** se utiliza para compartir información de autenticación y carrito entre distintas páginas, evitando pasar propiedades manualmente a través de múltiples componentes.

**useReducer** centraliza las operaciones del carrito, como agregar productos, eliminarlos y actualizar cantidades.

Se eligió esta combinación porque permite mantener una lógica predecible sin incorporar una biblioteca adicional de gestión de estado para las necesidades actuales del proyecto.

### Backend y persistencia

Firebase Authentication gestiona la identidad de los usuarios.

Cloud Firestore almacena perfiles, productos y pedidos.

Las funciones serverless de Vercel permiten realizar operaciones que requieren credenciales privadas, como validar compras y generar URLs prefirmadas para AWS S3.

## 5. Integración con AWS S3

Las imágenes de los productos se almacenan en AWS S3.

Se eligió S3 para separar el almacenamiento de archivos de la base de datos y utilizar un servicio especializado en almacenamiento de objetos.

### Flujo de carga mediante URL prefirmada

1. El administrador inicia sesión.
2. Selecciona una imagen para un producto.
3. El frontend solicita una URL de carga a `api/upload-url.ts`.
4. La función verifica el token de Firebase.
5. Se comprueba que el usuario tenga rol de administrador.
6. Se valida el formato de la imagen.
7. El servidor genera una URL prefirmada de AWS S3 con una duración de cinco minutos.
8. El navegador utiliza esa URL para cargar directamente la imagen en S3.
9. Se conserva la clave del objeto para poder recuperar la imagen posteriormente.

### Flujo de visualización

1. El frontend solicita la URL de una imagen mediante `api/image-url.ts`.
2. La función valida la clave del objeto.
3. Se genera una URL prefirmada de lectura con una duración de una hora.
4. El navegador utiliza esa URL para mostrar la imagen.

Este mecanismo permite trabajar con imágenes privadas **sin enviar credenciales de AWS al navegador**.

## 6. Seguridad

Se implementaron diferentes mecanismos de seguridad:

- Autenticación mediante Firebase Authentication.
- Roles de cliente y administrador.
- Protección de rutas administrativas.
- Reglas de acceso de Firestore.
- Variables de entorno para configuración y credenciales.
- Verificación de tokens de autenticación en funciones serverless.
- Validación de precios y stock desde la base de datos.
- Restricción de formatos de imagen.
- URLs prefirmadas de duración limitada.

### Procesamiento seguro de pedidos

El checkout utiliza la función serverless `api/create-order.ts`.

Esta función:

1. Verifica el token del usuario.
2. Recibe los identificadores y cantidades de los productos.
3. Consulta los precios y el stock actual en Firestore.
4. Valida la disponibilidad.
5. Actualiza el stock.
6. Registra el pedido con estado inicial `pending`.

La actualización del stock y la creación del pedido se realizan dentro de una **transacción de Firestore**, para mantener la consistencia de los datos.

Los clientes no pueden crear pedidos directamente en Firestore mediante las reglas de seguridad configuradas.

De esta manera, el navegador no puede establecer precios arbitrarios ni modificar directamente el stock durante el checkout.

## 7. Instalación local

### Requisitos

- Node.js y npm.
- Proyecto Firebase configurado.
- Firebase Authentication habilitado.
- Cloud Firestore configurado.
- Bucket de AWS S3.
- Credenciales y permisos necesarios para las funciones de servidor.

### Pasos

**1. Clonar el repositorio**

```bash
git clone https://github.com/florencianarvaez/argentina-club.git
```

**2. Entrar al proyecto**

```bash
cd argentina-club
```

**3. Instalar dependencias**

```bash
npm install
```

**4. Configurar las variables de entorno**

Copiar `.env.example` a un archivo `.env` local y completar las variables correspondientes.

Variables del frontend:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Variables utilizadas por las funciones de servidor:

```dotenv
AWS_REGION=eu-north-1
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
FIREBASE_SERVICE_ACCOUNT=
FIREBASE_SERVICE_ACCOUNT_JSON=
```

Las credenciales de AWS deben tener los permisos necesarios sobre el bucket correspondiente.

Las funciones de Firebase Admin admiten los nombres `FIREBASE_SERVICE_ACCOUNT` y `FIREBASE_SERVICE_ACCOUNT_JSON`. Solo es necesario configurar uno con el JSON válido de la cuenta de servicio.

**Importante:** las variables privadas deben configurarse en un entorno seguro de servidor. No deben incluirse en el repositorio ni utilizar el prefijo `VITE_`.

Para ejecutar también las funciones serverless en un entorno local, se requiere un entorno compatible con las funciones de Vercel. El servidor de desarrollo de Vite, por sí solo, no reproduce esas funciones.

**5. Iniciar el frontend**

```bash
npm run dev
```

**6. Generar la versión de producción**

```bash
npm run build
```

## 8. Pruebas automatizadas

El proyecto utiliza Vitest y React Testing Library para verificar el funcionamiento de distintas unidades de la aplicación.

Se implementaron inicialmente **21 pruebas automatizadas**, distribuidas entre:

- Operaciones del reducer del carrito.
- Comportamiento del contexto de autenticación.
- Funcionamiento del hook del carrito.

Para ejecutar las pruebas:

```bash
npx vitest run --environment jsdom
```

Las pruebas permiten detectar errores durante el desarrollo y comprobar que la lógica principal se comporte según lo esperado.

Adicionalmente, se realizó una prueba funcional del checkout desplegado, verificando:

- Creación del pedido.
- Visualización en el historial del usuario.
- Actualización del stock del producto.

## 9. Despliegue

La aplicación está desplegada en **Vercel** y vinculada al repositorio de GitHub.

Las funciones serverless permiten ejecutar operaciones de servidor, mientras que Firebase y AWS proporcionan los servicios externos de autenticación, persistencia y almacenamiento.

**Demo:** https://argentina-club.vercel.app/

## 10. Uso de inteligencia artificial

Durante el desarrollo se utilizó inteligencia artificial como herramienta de apoyo para analizar requisitos, planificar la arquitectura, revisar implementaciones, resolver problemas técnicos, diseñar pruebas y documentar decisiones.

Las propuestas fueron adaptadas al contexto del proyecto y contrastadas mediante revisión de código, compilaciones, pruebas automatizadas y verificaciones funcionales.

### Registro de cinco momentos de uso de IA

| Etapa | Uso de inteligencia artificial | Decisión o intervención propia | Aprendizaje |
|---|---|---|---|
| 1. Planificación | Analizar los requisitos y proponer una arquitectura modular. | Organizar el proyecto en componentes, páginas, contextos, servicios y funciones serverless. | Comprender la separación de responsabilidades entre frontend, servicios y servidor. |
| 2. Gestión del carrito | Proponer operaciones y casos de uso para Context API y `useReducer`. | Implementar y verificar las operaciones del carrito y su persistencia local. | Comprender las ventajas de centralizar las transiciones de estado. |
| 3. Integración de AWS S3 | Investigar errores de configuración de región y URLs prefirmadas. | Revisar la región real del bucket y ajustar la configuración de las funciones. | Comprender cómo funcionan las URLs prefirmadas y por qué deben protegerse las credenciales. |
| 4. Seguridad del checkout | Revisar los riesgos de crear pedidos directamente desde el cliente. | Trasladar la creación de pedidos a una función serverless que valida precios y stock mediante Firestore. | Comprender la importancia de validar las operaciones sensibles en el servidor. |
| 5. Pruebas y depuración | Proponer casos de prueba y ayudar a identificar errores de TypeScript. | Ejecutar pruebas, revisar resultados y corregir incompatibilidades de tipos. | Comprender cómo las pruebas automatizadas y el tipado ayudan a detectar errores. |

### Reflexión

La inteligencia artificial permitió acelerar determinadas tareas y explorar soluciones técnicas, pero sus respuestas no se consideraron automáticamente correctas.

Fue necesario revisar las propuestas, comprender su funcionamiento y realizar pruebas para verificar su integración.

Uno de los aprendizajes principales fue que utilizar IA de manera responsable implica **mantener el criterio técnico y la responsabilidad sobre el resultado final**.

El registro ampliado se encuentra en [BITACORA_IA.md](./BITACORA_IA.md).

## 11. Desafíos y aprendizajes

### Integración de servicios

Uno de los principales desafíos fue coordinar React, Firebase, AWS S3 y Vercel dentro de una misma aplicación.

### Gestión del estado

La implementación del carrito permitió aplicar Context API y `useReducer`, separando la lógica de negocio de los componentes visuales.

### Seguridad del checkout

Durante el desarrollo se identificó la necesidad de trasladar la creación de pedidos desde el navegador hacia una función segura de servidor.

Esto permitió evitar que el cliente pudiera establecer precios arbitrarios o modificar directamente el stock.

### Almacenamiento en AWS

La integración con S3 requirió configurar correctamente la región del bucket y las URLs prefirmadas para la carga y visualización de imágenes.

### Pruebas y TypeScript

La incorporación de pruebas automatizadas ayudó a verificar comportamientos y reducir errores durante las modificaciones del proyecto.

Los errores de compilación también permitieron identificar inconsistencias entre tipos compartidos y componentes de la interfaz.

## 12. Autora

**Florencia Narváez**

Proyecto académico Full Stack — Henry.

Desarrollado para el caso práctico de **Patagonix Tech**.

