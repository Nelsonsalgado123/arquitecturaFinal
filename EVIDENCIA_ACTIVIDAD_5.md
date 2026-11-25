# Evidencia de Ejecución - Actividad 5 (Orquestación con Docker Compose)

**Proyecto:** Calendario Laboral + API Festivos Colombia (Arquitectura Onion 5 módulos + Seguridad JWT + Docker Compose)  
**Estudiante:** Nelson Livanier Salgado Tejada  
**Docente:** Fray León Osorio Rivera  

---

## 1. Arquitectura y Orquestación Implementada

El archivo [`docker-compose.yml`](docker-compose.yml) orquesta los 4 contenedores sobre la red bridge `redcalendario`, con volúmenes persistentes, `restart: unless-stopped`, `healthcheck` y variables de entorno inyectadas al backend Spring Boot:

1. **`dockerbdfestivos`** (`mongo:7`, puerto `27019:27017`): Inicializa `festivos_db` con [`iniciarBDFestivos.js`](BD/bd-mongo-festivos/iniciarBDFestivos.js). Verifica salud con `mongosh` ping.
2. **`dockerapifestivos`** (`node`, puerto `3030:3030`): API ExpressJS + Mongoose conectada a `dockerbdfestivos` (`depends_on: service_healthy`). Expone Swagger en `/api-docs` con servidor relativo `/`.
3. **`dockerbdcalendario`** (`postgres:15`, puerto `5435:5432`): Inicializa base `calendario` con [`01_BD_Calendario.sql`](BD/bd-postgres-calendario/01_BD_Calendario.sql) (tablas `tipo`, `calendario`, `usuario` y secuencias JPA). Verifica salud con `pg_isready -h 127.0.0.1`.
4. **`dockerapicalendario`** (Multi-stage Maven 3.9 + Java 21 JRE, puerto `8080:8080`): Compila los 5 módulos Onion (`dominio`, `core`, `infraestructura`, `aplicacion`, `presentacion`), recibe variables de entorno (`SPRING_DATASOURCE_*`, `SERVICIO_FESTIVOS_URL`) desde el orquestador y arranca solo cuando `dockerbdcalendario` y `dockerapifestivos` están `healthy`.

---

## 2. Evidencias de Creación y Despliegue (Checklist de Capturas / Video)

> Agrega aquí tus capturas de pantalla (o convierte este documento a PDF / graba un video siguiendo estos 5 puntos exactos que pide el profesor):

### Evidencia 1: Construcción y arranque con `docker compose`
Comando ejecutado:
```powershell
docker compose up -d --build
docker compose ps
```
*[Insertar captura de la terminal mostrando la compilación multi-stage exitosa, los 4 contenedores `Up` y las bases de datos `Healthy`]*

### Evidencia 2: Estado de contenedores e imágenes en Docker Desktop
*[Insertar captura de Docker Desktop mostrando el stack corriendo y el detalle de los 4 contenedores]*

### Evidencia 3: Swagger API Festivos (ExpressJS + MongoDB)
URL: `http://localhost:3030/api-docs`  
Prueba realizada: `GET /api/festivos/obtener/2027` y `GET /api/festivos/verificar/2027/7/20`  
*[Insertar captura mostrando la respuesta `200` con los festivos calculados en MongoDB]*

### Evidencia 4: Seguridad JWT (Bloqueo `403` sin token + Login `200`)
1. Petición sin token a `http://localhost:8080/api/calendario/listar/2027` → **HTTP `403 Forbidden`**.  
2. Autenticación en Swagger (`http://localhost:8080/swagger-ui/index.html`) o Postman:  
   `GET http://localhost:8080/api/usuarios/validar/admin/admin123` → **HTTP `200`** con JWT token.  
*[Insertar captura del `403` sin token y del token recibido en `/api/usuarios/validar/...`]*

### Evidencia 5: Prueba de integración completa (`Calendario 2027` + `Tipos` con Bearer JWT)
1. Autorizar en Swagger UI (**Authorize** -> pegar JWT) o Postman (`Authorization: Bearer <token>`).
2. Ejecutar `GET /api/tipos/` (lista `Día laboral`, `Fin de semana`, `Día festivo`).
3. Ejecutar `GET /api/calendario/generar/2027` → retorna `true` (consulta en una sola petición HTTP los festivos de 2027 a `dockerapifestivos` y persiste los 365 días en PostgreSQL).
4. Ejecutar `GET /api/calendario/listar/2027` → retorna los 365 días clasificados con su respectivo `Tipo` y descripción del festivo.  
*[Insertar captura de `/api/calendario/generar/2027` (`true`) y `/api/calendario/listar/2027` (`365` registros)]*
