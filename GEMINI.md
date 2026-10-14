# Gastrosuite - Reglas Base y Contexto

## 1. Contexto General del Proyecto
- **Proyecto:** Gastrosuite
- **Arquitectura:** Monorepo con Angular 17 (Frontend) y NestJS 10 (Backend).
- **Base de Datos:** MariaDB remoto (alojado en un VPS), consultado y administrado vÃ­a DBeaver.
- **ORM:** Prisma ORM 7.x (ubicado en `/backend/prisma`).
- **DiseÃ±o de Base de Datos:** Modelo de llaves hÃ­brido. Se usan UUIDs (String) para las relaciones y sincronizaciÃ³n offline, acompaÃ±ados de identificadores secundarios `ids` (Int, autoincrementables) para lectura humana y cajeros.

## 2. Trabajo en Equipo y ColaboraciÃ³n
- **ColaboraciÃ³n:** Trabajo en conjunto con mi esposo/colega en este mismo proyecto.
- **PrecauciÃ³n:** Es VITAL tener cuidado de no sobreescribir el trabajo de la otra persona. Todas las decisiones de control de versiones y manejo de ramas deben considerar este trabajo colaborativo y concurrente.
- **Estrategia de ramas:** 
  - `main`: CÃ³digo estable / ProducciÃ³n.
  - `dev`: Rama principal de desarrollo e integraciÃ³n de ambos.
  - `feature-italia`: Rama de trabajo personal de Italia.
  - `feature-ivan`: Rama de trabajo personal de IvÃ¡n.

## 3. Fin de Jornada Laboral (Prompt de Cierre)
- **Regla:** Ãšnica y exclusivamente cuando yo te indique explÃ­citamente la frase "ya finalizamos el dÃ­a laboral" o similar, deberÃ¡s entregarme un prompt actualizado detallando el "Estatus Actual" (resumiendo todo lo hecho en las sesiones pasadas y en la de ese dÃ­a) y la "Siguiente Tarea", para no perder el hilo al iniciar al dÃ­a siguiente.
- **CondiciÃ³n:** NUNCA me entregues el prompt de cierre de dÃ­a a menos que yo te indique que ya terminamos de trabajar por hoy.

## 4. ReutilizaciÃ³n de Componentes y UI Kit (G)
- **UI Kit Compartido:** SIEMPRE debes verificar y priorizar el uso de los componentes existentes en el directorio `shared/components` (el UI Kit del proyecto, ej. selectores, modales, alertas, headers, etc.).
- **Regla Estricta:** NUNCA crees componentes nativos genÃ©ricos (como `<select>`, `<button>` sin clases del kit, o modales crudos) si ya existe una versiÃ³n configurada en el UI Kit. Todo lo que sea reutilizable debe salir de `shared` para mantener la consistencia visual.

## 5. Idioma y Nomenclatura
- **ComunicaciÃ³n:** SIEMPRE debes hablarme en espaÃ±ol. **Tus respuestas deben ser extremadamente breves, directas y concisas, dando solo la informaciÃ³n estrictamente necesaria.**
- **ConfirmaciÃ³n de AcciÃ³n (G):** Para la *ejecuciÃ³n tÃ©cnica* (modificar archivos, comandos locales), toma el control y procede sin preguntar paso a paso. Sin embargo, para la *planificaciÃ³n estratÃ©gica* (quÃ© vista construir, quÃ© funcionalidades incluir, quÃ© diseÃ±o usar), SIEMPRE debemos hablarlo y acordarlo primero. Una vez que te dÃ© el "procede", ejecutas todo el plan tÃ©cnico sin detenerte. La Ãºnica otra excepciÃ³n de confirmaciÃ³n obligatoria es antes de un `commit` o `push` a Git.
- **Pull Obligatorio (G):** SIEMPRE debes ejecutar un pull antes de hacer cualquier cosa, tanto para sincronizar Prisma (`npx prisma db pull`) como para sincronizar Git (`git pull`).
- **CÃ³digo y Componentes:** TODOS los nombres de archivos, componentes, variables y rutas deben estar SIEMPRE en espaÃ±ol, salvo palabras clave propias del framework o estÃ¡ndares irremplazables (ej. `dashboard` o `staff` si se prefiere, aunque mejor `personal`).

## 5. Consultas a la Base de Datos (G)
- **Regla de Identificadores (G):** Para TODA consulta que se realice a la base de datos, se debe utilizar PRINCIPALMENTE el campo `ids` (entero autoincremental de lectura humana). Igualmente, puedes utilizar el `id` (UUID) que dejamos para manejo interno. Es decir, en las consultas utiliza AMBOS para asegurarnos de la integridad.

## 6. UI Kit Estricto (G)
- **Componentes:** ESTRICTAMENTE usa los componentes del UI Kit (pp-custom-select, el spinner oficial, etc.). NUNCA inventes nuevos diseños, clases nativas o colores dolorosos (ej. botones de archivo con colores chillones).
- **Selects:** TODO select, sin excepción, debe tener como primera opción "Seleccionar..." (o equivalente), y estar deshabilitada.
- **Spinners y Carga:** Si vas a mostrar un estado de carga, USA EL SPINNER DEL KIT. No crees spinners nativos en HTML ni uses texto crudo como "Cargando...".

## 7. Limpieza para Entregables (Regla Estricta)
- **Activación:** Única y exclusivamente cuando el usuario indique explícitamente que se está listo para un **primer entregable** (o entregable formal), se DEBE realizar una LIMPIEZA profunda del proyecto: eliminar archivos basura, código muerto, funciones o componentes no utilizados, logs temporales y scripts residuales.
- **Recordatorio Proactivo:** NO ejecutar la limpieza antes de tiempo. Si el usuario menciona que va a realizar un primer entregable y no ha solicitado la limpieza, la IA debe recordárselo proactivamente antes de cerrar la entrega.

## 8. Cero Interrupciones y Prohibición de Modales del IDE (Regla Estricta)
- **Prohibición de Modales del IDE:** Queda terminantemente PROHIBIDO ejecutar comandos de terminal/shell que provoquen ventanas emergentes de solicitud de permisos al usuario (tales como `git log`, `git diff`, `git status`, `Get-ChildItem`, búsquedas vía consola o cualquier comando que active ventanas tipo *"Allow running this command?"*).
- **Herramientas Nativas Exclusivas:** Para explorar directorios, buscar, leer, editar o inspeccionar historial y archivos, utiliza EXCLUSIVAMENTE las herramientas nativas del agente (`list_dir`, `grep_search`, `view_file`, `replace_file_content`).
- **Autonomía Absoluta:** No hagas preguntas innecesarias ni pidas autorizaciones paso a paso para tareas técnicas. Procede directamente con las soluciones sin interrumpir.

## 9. Diseño Estrictamente Minimalista (Regla Estricta)
- **Minimalismo Absoluto:** Mantén en TODOS los casos, sin excepción, un diseño lo más minimalista, limpio y sobrio posible.
- **Limpieza Visual:** Evita interfaces sobrecargadas, información redundante, decoraciones innecesarias, sombras pesadas o bordes excesivos. Prioriza la respiración de espacios (whitespace), balance visual, tipografía clara y componentes pulidos respetando fielmente la paleta orgánica de Gastrosuite.
