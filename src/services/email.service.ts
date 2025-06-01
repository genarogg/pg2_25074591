// src/services/email.service.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailData {
  nombre: string;
  email: string;
  comentario: string;
  IpAddress: string;
  pais: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendNotificationEmail(data: EmailData): Promise<void> {
    const fechaHora = new Date().toLocaleString();
    // Lista de destinatarios fijos más el email del usuario
    const destinatarios = [
      'programacion2ais@yopmail.com',
      'omaraugusto0502@gmail.com',
      data.email // Email del usuario que completó el formulario
    ].filter(Boolean); // Filtra cualquier valor undefined/null

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatarios.join(','), // Une los correos con comas
      subject: 'Nueva cita agendada',
      html: `
        <h2>Nueva cita agendada</h2>
        <p><strong>Nombre:</strong> ${data.nombre}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Comentario:</strong> ${data.comentario}</p>
        <p><strong>Dirección IP:</strong> ${data.IpAddress}</p>
        <p><strong>País:</strong> ${data.pais}</p>
        <p><strong>Fecha/Hora:</strong> ${fechaHora}</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Correo de notificación enviado correctamente a:', destinatarios);
    } catch (error) {
      console.error('Error al enviar el correo de notificación:', error);
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }
}