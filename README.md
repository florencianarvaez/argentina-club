# 🇦🇷 Argentina Club

### AI Driven E-Commerce | Proyecto Full Stack

**Argentina Club** es una aplicación web de comercio electrónico desarrollada como proyecto académico para **Patagonix Tech**, en el marco de la formación Full Stack de Henry.

La plataforma permite explorar productos argentinos, gestionar un carrito de compras, realizar pedidos y consultar su historial. También incorpora un panel de administración para gestionar productos y pedidos.

🔗 **Aplicación desplegada:** https://argentina-club.vercel.app/

## 1. Objetivo del proyecto

Desarrollar una aplicación de comercio electrónico que integre autenticación, persistencia de datos, gestión de productos, procesamiento de pedidos y almacenamiento de imágenes en la nube.

El proyecto busca aplicar buenas prácticas de desarrollo, arquitectura modular, seguridad, pruebas automatizadas y uso responsable de herramientas de inteligencia artificial.

## 2. Tecnologías utilizadas

| Tecnología | Aplicación |
|---|---|
| React 18 | Construcción de interfaces |
| TypeScript | Tipado estático |
| Vite | Entorno de desarrollo y compilación |
| React Router | Navegación |
| Context API | Gestión de estado global |
| useReducer | Gestión del carrito |
| Firebase Authentication | Autenticación de usuarios |
| Cloud Firestore | Base de datos |
| Firebase Admin SDK | Operaciones seguras del servidor |
| AWS S3 | Almacenamiento de imágenes |
| Vercel | Despliegue y funciones serverless |
| Vitest | Pruebas automatizadas |

## 3. Funcionalidades

### Clientes

- Registro e inicio de sesión.
- Autenticación mediante correo electrónico y Google.
- Visualización del catálogo de productos.
- Consulta de información y precios.
- Carrito de compras con actualización de cantidades.
- Persistencia local del carrito.
- Confirmación de pedidos.
- Consulta del historial de compras.

### Administradores

- Acceso a funcionalidades según el rol del usuario.
- Creación, edición y gestión de productos.
- Administración del stock.
- Carga de imágenes.
- Consulta de pedidos.
- Actualización del estado de los pedidos.

## 4. Arquitectura

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

Context API se utiliza para compartir información de autenticación y carrito.

El carrito implementa `useReducer` para centralizar sus operaciones y mantener un comportamiento predecible.

### Backend y persistencia

Firebase Authentication gestiona la identidad de los usuarios.

Cloud Firestore almacena los perfiles, productos y pedidos.

Las funciones serverless de Vercel permiten realizar operaciones que requieren credenciales privadas.

### Almacenamiento de imágenes

Las imágenes se almacenan en AWS S3.

La aplicación utiliza URLs prefirmadas para realizar operaciones autorizadas sin exponer credenciales de AWS en el navegador.

## 5. Seguridad

Se implementaron diferentes mecanismos de seguridad:

- Autenticación de usuarios mediante Firebase.
- Roles de cliente y administrador.
- Reglas de acceso de Firestore.
- Protección de credenciales mediante variables de entorno.
- Verificación de tokens de autenticación en el servidor.
- Validación de precios y stock desde la base de datos.

### Procesamiento seguro de pedidos

El checkout utiliza la función serverless `api/create-order.ts`.

Esta función:

1. Verifica el token del usuario.
2. Recibe los identificadores y cantidades de los productos.
3. Consulta los precios y el stock actual en Firestore.
4. Valida la disponibilidad.
5. Actualiza el stock.
6. Registra el pedido.

La actualización del stock y la creación del pedido se realizan dentro de una transacción para mantener la consistencia de los datos.

Los clientes no pueden crear pedidos directamente mediante las reglas de Firestore.

## 6. Instalación local

### Requisitos

- Node.js
- npm
- Proyecto Firebase configurado
- Credenciales y servicios externos necesarios

### Pasos

Clonar el repositorio:

```bash
git clone https://github.com/florencianarvaez/argentina-club.git
```

Entrar al proyecto:

```bash
cd argentina-club
```

Instalar dependencias:

```bash
npm install
```

Configurar las variables de entorno necesarias.

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Generar la versión de producción:

```bash
npm run build
```

> Las credenciales privadas de Firebase Admin y AWS deben mantenerse exclusivamente en entornos seguros de servidor. Nunca deben publicarse en el repositorio.

## 7. Pruebas automatizadas

El proyecto utiliza Vitest para verificar el funcionamiento de distintas unidades de la aplicación.

Se implementaron **21 pruebas automatizadas** distribuidas entre:

- Operaciones del reducer del carrito.
- Comportamiento del contexto de autenticación.
- Funcionamiento del hook del carrito.

Para ejecutar las pruebas:

```bash
npx vitest run --environment jsdom
```

Las pruebas permiten detectar errores durante el desarrollo y comprobar que la lógica principal se comporte según lo esperado.

Adicionalmente, se realizó una prueba funcional del checkout desplegado, verificando la creación del pedido, su visualización en el historial y la actualización del stock.

## 8. Despliegue

La aplicación está desplegada en Vercel y vinculada al repositorio de GitHub.

Las funciones serverless permiten ejecutar operaciones de servidor, mientras que Firebase y AWS proporcionan los servicios externos de autenticación, persistencia y almacenamiento.

**Demo:** https://argentina-club.vercel.app/

## 9. Uso de inteligencia artificial

Durante el desarrollo se utilizaron herramientas de inteligencia artificial como apoyo para:

- Planificar la arquitectura.
- Analizar requisitos.
- Revisar implementaciones.
- Resolver errores de TypeScript y configuración.
- Diseñar pruebas automatizadas.
- Evaluar decisiones de seguridad.
- Documentar el proyecto.

Las sugerencias generadas fueron revisadas, adaptadas y verificadas mediante compilaciones, pruebas y comprobaciones funcionales.

El registro de decisiones y reflexiones sobre el uso de IA se documenta en la bitácora del proyecto.

## 10. Desafíos y aprendizajes

### Integración de servicios

Uno de los principales desafíos fue coordinar React, Firebase, AWS S3 y Vercel dentro de una misma aplicación.

### Gestión del estado

La implementación del carrito permitió aplicar Context API y `useReducer`, separando la lógica de negocio de los componentes visuales.

### Seguridad del checkout

Durante el desarrollo se identificó la necesidad de trasladar la creación de pedidos desde el navegador hacia una función segura de servidor.

Esto permitió evitar que el cliente pudiera establecer precios arbitrarios o modificar directamente el stock.

### Almacenamiento en AWS

La integración con S3 requirió configurar correctamente la región del bucket y las URLs prefirmadas para la carga y visualización de imágenes.

### Pruebas

La incorporación de pruebas automatizadas ayudó a verificar comportamientos y reducir errores durante las modificaciones del proyecto.

## 11. Autora

**Florencia Narváez**

Proyecto académico Full Stack — Henry.

Desarrollado para el caso práctico de **Patagonix Tech**.

