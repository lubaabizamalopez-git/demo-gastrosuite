# Convenciones de Desarrollo - Gastrosuite

Este documento unifica todas las reglas de nomenclatura y convenciones para el proyecto Gastrosuite.

## 1. Reglas Generales
* **Idioma:** Todo el código (carpetas, archivos, variables, funciones, clases, componentes) debe estar en **español**, con excepción de palabras clave propias de los frameworks o librerías (ej. `AppModule`, `main.ts`, `interface`).
* **Comunicación de la IA:** La IA siempre debe comunicarse en español y solicitar confirmación expresa antes de ejecutar cualquier cambio de archivos o comandos.

## 2. Base de Datos
* **Claves (IDs):** Todas las consultas e interacciones deben usar principalmente el campo `ids` (entero autoincrementable de lectura humana). De igual modo, se puede utilizar el `id` (UUID string) de manejo interno para garantizar integridad, pero el `ids` es prioritario.

## 3. Frontend (Angular)
* **Componentes:**
  * Archivos: `kebab-case` (`mi-componente.component.ts`).
  * Selectores: `kebab-case` (`<app-mi-componente>`).
* **Módulos:**
  * Carpetas y archivos en `kebab-case`. Finalizan con `Module` (`inventario.module.ts`, `InventarioModule`).
* **Servicios:**
  * Finalizan en `Service` (`InventarioService`).
* **Modelos/Interfaces:**
  * Nombres en `PascalCase`, descriptivos y sin prefijos tipo `I` (ej. `Producto`, `Categoria`). Archivos con sufijo `.model.ts` o `.interface.ts`.
* **Variables y Funciones:**
  * `camelCase`. Funciones deben usar verbos claros en infinitivo (`obtenerProductos()`, `guardarDatos()`).
* **Rutas:**
  * URL siempre en español, palabras separadas por guiones (`/configuracion-sistema`).

## 4. Backend (NestJS)
* **Estructura Modular:** Archivos agrupados por dominio en la carpeta `modules/` (ej. `modules/catalogo`).
* **Endpoints REST:**
  * Usar plural, minúsculas y guiones.
  * Correcto: `/api/v1/consultas/crear-consulta`.
  * Incorrecto: `/api/v1/CrearConsulta`.
  * *Rutas Base:* Siempre prefijadas con `/api/v1/...`.
* **Servicios:**
  * Finalizan en `Service` (ej. `ConsultasService`).
  * En NestJS no usaremos la división Interface/Implementación (estándar de Spring Boot), a menos que haya múltiples implementaciones del mismo servicio.
  * Métodos deben usar verbos claros en infinitivo: `crearConsulta()`, `actualizarConsulta()`, `eliminarConsulta()`.
* **Controladores:**
  * Terminación en `Controller` (ej. `ConsultasController`).
  * Métodos deben reflejar el endpoint: `@Get("/obtener-categorias") → obtenerCategorias()`.
* **DTOs:**
  * Entradas terminan en `Request` (ej. `CrearConsultaRequest`).
  * Salidas terminan en `Response` (ej. `CrearConsultaResponse`).
  * Agrupar en carpetas `dto/` dentro de cada módulo.

## 5. Repositorio y Git Commits
Usaremos prefijos envueltos en corchetes para identificar rápidamente la naturaleza del cambio:

* `[feat]`: para nuevas funcionalidades.
* `[fix]`: para corrección de errores.
* `[docs]`: para actualizaciones de documentación.
* `[chore]`: para tareas de mantenimiento o actualización de dependencias.
* `[refactor]`: reestructuración de código sin alterar comportamiento.
