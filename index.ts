// Limpia la consola
import clear from "console-clear";
clear();

// Importaciones principales
import express from 'express';
import path from 'path';
import cors from "cors";
import { log } from "@fn";
import { inicioRouter } from "@router";

// Configuración de la aplicación
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware básicos
app.use(express.static(path.join(__dirname, "./src/public")));

// Usa cors como middleware
const CORS_URL = process.env.CORS_URL || "*";
app.use(cors({ origin: CORS_URL }));

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración del motor de vistas
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "./src/views"));

// Configuración de rutas
app.use("/", inicioRouter);

// Middleware de manejo de errores
app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).send("¡Algo salió mal!");
});

// Iniciar el servidor
app.listen(PORT, () => {
    log.success(`El servidor está corriendo en http://localhost:${PORT}`);
});