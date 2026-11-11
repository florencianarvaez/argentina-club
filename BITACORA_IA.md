# Bitácora de uso de inteligencia artificial

## Proyecto: Argentina Club

**Autora:** Florencia Narváez  
**Proyecto:** AI Driven E-Commerce  
**Cliente del caso práctico:** Patagonix Tech  
**Formación:** Henry — Full Stack

## Introducción

Durante el desarrollo de Argentina Club utilicé ChatGPT como herramienta de apoyo para planificar, implementar, revisar y documentar diferentes funcionalidades.

El objetivo no fue únicamente generar código, sino comprender las decisiones técnicas, identificar problemas y comprobar el funcionamiento de las soluciones propuestas.

A continuación, presento cinco experiencias relevantes y una reflexión final sobre el uso de inteligencia artificial durante el proyecto.

---

## Entrada 1 — Planificación y arquitectura

**Situación**

Al comenzar el proyecto necesitaba organizar los requisitos técnicos y definir una estructura que permitiera integrar React, Firebase, AWS S3 y Vercel.

**Uso de IA**

Utilicé ChatGPT para analizar las funcionalidades requeridas, dividir el trabajo en etapas y proponer una organización de carpetas y responsabilidades.

**Decisión tomada**

Organicé el proyecto separando componentes, páginas, contextos, servicios, hooks y tipos.

También utilicé Context API para compartir información entre componentes.

**Resultado**

Esta estructura facilitó el desarrollo progresivo de la aplicación y permitió incorporar nuevas funcionalidades sin concentrar toda la lógica en un único archivo.

**Reflexión**

Aprendí que la IA puede ayudar a organizar un proyecto complejo, pero que es importante comprender las responsabilidades de cada módulo antes de implementar las sugerencias.

---

## Entrada 2 — Gestión del carrito con useReducer

**Situación**

Necesitaba implementar un carrito que permitiera agregar productos, modificar cantidades, eliminar artículos y calcular importes.

**Uso de IA**

Solicité asistencia para diseñar la lógica del carrito mediante React Context API y `useReducer`.

**Decisión tomada**

Centralicé las operaciones del carrito en un reducer y utilicé un contexto para compartir su estado.

También incorporé persistencia local para conservar los productos seleccionados.

**Resultado**

El carrito quedó integrado con las distintas páginas y permitió mantener una lógica de actualización consistente.

**Reflexión**

Comprendí que `useReducer` resulta útil cuando un estado tiene varias operaciones relacionadas. Separar esas operaciones también facilita la escritura de pruebas automatizadas.

---

## Entrada 3 — Integración de AWS S3

**Situación**

El proyecto requería almacenar imágenes de productos utilizando AWS S3.

Durante las pruebas aparecieron problemas relacionados con la configuración del servicio y la visualización de imágenes.

**Uso de IA**

Utilicé ChatGPT para revisar la integración, analizar posibles causas de los errores y comprender el funcionamiento de las URLs prefirmadas.

**Decisión tomada**

Implementé funciones serverless para generar URLs prefirmadas y mantener las credenciales privadas fuera del navegador.

También corregí la configuración de región para que coincidiera con la ubicación real del bucket.

**Resultado**

La aplicación permitió cargar imágenes de productos y visualizarlas correctamente en el catálogo.

**Reflexión**

Aprendí que una implementación puede ser conceptualmente correcta y fallar por detalles de configuración. La IA fue útil para orientar el diagnóstico, pero la solución necesitó comprobaciones concretas en AWS y en la aplicación desplegada.

---

## Entrada 4 — Seguridad en el proceso de compra

**Situación**

Inicialmente, la creación de pedidos se realizaba desde el cliente mediante una transacción de Firestore.

Al revisar las reglas de seguridad, identifiqué que los clientes no tenían permisos para modificar directamente el stock de los productos.

Además, permitir la creación directa de pedidos podía generar riesgos si no se validaban los precios desde una fuente confiable.

**Uso de IA**

Solicité ayuda para analizar el problema y evaluar una alternativa que mantuviera la seguridad de la base de datos.

**Decisión tomada**

Trasladé el procesamiento de pedidos a una función serverless de Vercel utilizando Firebase Admin SDK.

La función verifica el token del usuario, consulta los productos reales, valida precios y disponibilidad, y realiza una transacción para actualizar el stock y registrar el pedido.

También actualicé las reglas de Firestore para impedir la creación directa de pedidos desde el navegador.

**Resultado**

Realicé una compra de prueba en la aplicación desplegada y comprobé que el pedido se registraba, aparecía en el historial y descontaba correctamente el stock.

**Reflexión**

Esta fue una de las decisiones técnicas más importantes del proyecto.

Comprendí que no alcanza con que una funcionalidad opere correctamente: también debe respetar los permisos y proteger la integridad de los datos.

La IA permitió detectar una debilidad en el diseño inicial y analizar una solución más segura.

---

## Entrada 5 — Pruebas automatizadas y resolución de errores

**Situación**

Necesitaba comprobar el comportamiento de distintas funcionalidades y asegurarme de que las modificaciones no introdujeran errores.

Durante el desarrollo también aparecieron errores de TypeScript relacionados con importaciones y funciones faltantes.

**Uso de IA**

Utilicé ChatGPT para revisar mensajes de error, preparar pruebas unitarias y proponer correcciones.

**Decisión tomada**

Incorporé Vitest y desarrollé pruebas para:

- El reducer del carrito.
- El contexto de autenticación.
- El hook del carrito.

Además, utilicé el proceso de compilación para detectar problemas de tipado.

**Resultado**

Se ejecutaron correctamente 21 pruebas automatizadas y se verificó la compilación del proyecto.

**Reflexión**

Aprendí que la IA puede generar propuestas que necesitan ajustes. Por eso, compilar, ejecutar pruebas y revisar los resultados es indispensable.

La experiencia reforzó la importancia de no asumir que una respuesta generada automáticamente es correcta sin verificarla.

---

## Reflexión final

El desarrollo de Argentina Club me permitió experimentar con la inteligencia artificial como herramienta de apoyo durante diferentes etapas de un proyecto Full Stack.

Su mayor aporte fue ayudarme a dividir problemas complejos en tareas concretas, comprender errores y explorar alternativas de implementación.

También encontré limitaciones: algunas propuestas necesitaron correcciones, y determinadas soluciones debieron modificarse después de revisar requisitos de seguridad o ejecutar pruebas.

Considero que el uso responsable de IA requiere mantener una actitud crítica, comprender el código incorporado y validar los resultados.

**Mi principal aprendizaje fue que la inteligencia artificial puede acelerar el desarrollo, pero no reemplaza la comprensión técnica ni la responsabilidad de verificar lo que se construye.**

