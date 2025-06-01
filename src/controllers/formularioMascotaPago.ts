import { Request, Response } from "express";
import { initDB } from "../database/database";
import axios from 'axios';

export const formularioMascotaPago = (req: Request, res: Response) => {
    res.render("formularioMascotaPago", { data: "express" });
}

export const formularioMascotaPagoPost = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { 
            email,
            nombre,
            numeroTarjeta,
            fechaVencimientoM,
            fechaVencimientoY,
            cvv,
            monto,
            tipoPago,
        } = req.body;
        
        // Validar que todos los campos estén presentes
        if (!email || !nombre || !numeroTarjeta || !fechaVencimientoM || 
            !fechaVencimientoY || !cvv || !monto || !tipoPago) {
            res.status(400).json({ error: "Todos los campos son requeridos" });
            return;
        }

        // Primero procesar el pago con la API Fake Payment
        const paymentData = {
            email,
            card: {
                name: nombre,
                number: numeroTarjeta,
                exp_month: fechaVencimientoM,
                exp_year: fechaVencimientoY,
                cvc: cvv
            },
            amount: monto,
            payment_method: tipoPago
        };

        // Enviar pago a la API Fake Payment
        const paymentResponse = await axios.post('https://fakepayment.onrender.com/charge', paymentData);

        // Define la interfaz para la respuesta del pago
        interface PaymentResponseData {
            paid: boolean;
            // Puedes agregar más campos si la API los devuelve
        }

        // Usa la interfaz para asegurar el tipo
        const data = paymentResponse.data as PaymentResponseData;

        // Verificar si el pago fue exitoso
        if (data.paid !== true) {
            throw new Error('El pago no fue procesado correctamente');
        }

        // Si el pago es exitoso, guardar en la base de datos
        const db = await initDB();
        const result = await db.run(
            'INSERT INTO pagos (email, nombre, numerotarjeta, fechavencimientom, fechavencimientoy, cvv, monto, tipopago) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [email, nombre, numeroTarjeta, fechaVencimientoM, fechaVencimientoY, cvv, monto, tipoPago]
        );

        console.log('Registro insertado con ID:', result.lastID);

        // Redirigir a una página de éxito o mostrar mensaje
        res.status(201).json({ 
            success: true,
            message: "Pago exitoso",
            id: result.lastID
        });
    } catch (error) {
        console.error("Error en formularioMascotaPost:", error);
        res.status(500).json({ 
            error: "Error al procesar el pago",
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}