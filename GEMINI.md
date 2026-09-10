# Gastrosuite - Reglas Base y Contexto

## 1. Contexto General del Proyecto
- **Proyecto:** Gastrosuite
- **Arquitectura:** Monorepo con Angular 17 (Frontend) y NestJS 10 (Backend).
- **Base de Datos:** MariaDB remoto (alojado en un VPS), consultado y administrado vía DBeaver.
- **ORM:** Prisma ORM 7.x (ubicado en `/backend/prisma`).
- **Diseño de Base de Datos:** Modelo de llaves híbrido. Se usan UUIDs (String) para las relaciones y sincronización offline, acompañados de identificadores secundarios `ids` (Int, autoincrementables) para lectura humana y cajeros.

## 2. Trabajo en Equipo y Colaboración
- **Colaboración:** Trabajo en conjunto con mi esposo/colega en este mismo proyecto.
- **Precaución:** Es VITAL tener cuidado de no sobreescribir el trabajo de la otra persona. Todas las decisiones de control de versiones y manejo de ramas deben considerar este trabajo colaborativo y concurrente.
- **Estrategia de ramas:** 
  - `main`: Código estable / Producción.
  - `dev`: Rama principal de desarrollo e integración de ambos.
  - `feature-italia`: Rama de trabajo personal de Italia.
  - `feature-ivan`: Rama de trabajo personal de Iván.

## 3. Fin de Jornada Laboral (Prompt de Cierre)
- **Regla:** Única y exclusivamente cuando yo te indique explícitamente la frase "ya finalizamos el día laboral" o similar, deberás entregarme un prompt actualizado detallando el "Estatus Actual" (resumiendo todo lo hecho en las sesiones pasadas y en la de ese día) y la "Siguiente Tarea", para no perder el hilo al iniciar al día siguiente.
- **Condición:** NUNCA me entregues el prompt de cierre de día a menos que yo te indique que ya terminamos de trabajar por hoy.

## 4. Idioma y Nomenclatura
- **Comunicación:** SIEMPRE debes hablarme en español.
- **Confirmación de Acción (G):** Antes de ejecutar CUALQUIER cosa (comandos, cambios en archivos), SIEMPRE debes preguntarme en español primero y esperar mi confirmación.
- **Código y Componentes:** TODOS los nombres de archivos, componentes, variables y rutas deben estar SIEMPRE en español, salvo palabras clave propias del framework o estándares irremplazables (ej. `dashboard` o `staff` si se prefiere, aunque mejor `personal`).

## 5. Consultas a la Base de Datos (G)
- **Regla de Identificadores (G):** Para TODA consulta que se realice a la base de datos, se debe utilizar PRINCIPALMENTE el campo `ids` (entero autoincremental de lectura humana). Igualmente, puedes utilizar el `id` (UUID) que dejamos para manejo interno. Es decir, en las consultas utiliza AMBOS para asegurarnos de la integridad.
