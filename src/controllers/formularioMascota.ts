import { Request, Response } from "express";
import { initDB } from "../database/database";

export const formularioMascota = (req: Request, res: Response) => {
    res.render("formularioMascota", { data: "express" });
}

export const formularioMascotaPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { Nombre, Email, Comentario } = req.body;
        
        // Validación de campos (manteniendo tus nombres en español)
        if (!Nombre || !Email || !Comentario) {
            res.status(400).json({ error: "Todos los campos son requeridos" });
            return;
        }

        // Obtener IP del cliente (compatible con diferentes configuraciones)
        const ipCliente = req.ip || 
                         (req.headers['x-forwarded-for'] as string || '').split(',')[0] || 
                         req.socket.remoteAddress;

        const db = await initDB();

        // Insertar en la base de datos con IP y fecha automática
        const result = await db.run(
            `INSERT INTO contactos (
                Email, 
                Nombre, 
                Comentario,
                IpAddress,
                FechaRegistro
            ) VALUES (?, ?, ?, ?, datetime('now'))`,
            [Email, Nombre, Comentario, ipCliente]
        );

        console.log('Registro insertado con ID:', result.lastID);

        res.status(201).json({ 
            success: true,
            message: "Mascota registrada exitosamente",
            data: {
                id: result.lastID,
                Nombre,
                Email,
                Ip: ipCliente,
                Fecha: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("Error en formularioMascotaPost:", error);
        
        // Manejo mejorado de errores
        let mensajeError = "Error interno del servidor";
        if (error instanceof Error) {
            mensajeError = error.message;
            // Detección de errores específicos de SQLite
            if (error.message.includes('SQLITE_ERROR: no such table')) {
                mensajeError = "Error en la base de datos: tabla no existe";
            }
        }

        res.status(500).json({ 
            error: mensajeError,
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};