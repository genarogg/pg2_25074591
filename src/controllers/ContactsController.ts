import { Request, Response } from 'express';
import { ContactsModel } from '../models/ContactsModel';
import { validationResult } from 'express-validator';
import { GeolocationService } from '../services/geolocation.service';
import { RecaptchaService } from '../services/recaptcha.service';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export class ContactsController {
  private contactsModel: ContactsModel;
  private geolocationService: GeolocationService;
  private recaptchaService: RecaptchaService;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.contactsModel = new ContactsModel();
    this.geolocationService = new GeolocationService();
    this.recaptchaService = new RecaptchaService();
    
    // Configuración del transporter de nodemailer
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  private async sendNotificationEmail(contactData: {
    email: string;
    nombre: string;
    comentario: string;
    IpAddress: string;
    pais: string;
  }): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ['programacion2ais@yopmail.com', contactData.email],
      subject: 'Nueva cita agendada',
      html: `
        <h2>Nueva cita agendada</h2>
        <p><strong>Nombre:</strong> ${contactData.nombre}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Comentario:</strong> ${contactData.comentario}</p>
        <p><strong>Dirección IP:</strong> ${contactData.IpAddress}</p>
        <p><strong>País:</strong> ${contactData.pais}</p>
        <p><strong>Fecha/Hora:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Correo de notificación enviado correctamente');
    } catch (error) {
      console.error('Error al enviar el correo de notificación:', error);
      // No hacemos throw para no interrumpir el flujo principal
    }
  }

  add = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("Token recibido del cliente:", req.body['g-recaptcha-response']);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Validación reCAPTCHA
      const recaptchaToken = req.body['g-recaptcha-response'];
      const isHuman = await this.recaptchaService.verifyToken(recaptchaToken);
      
      if (!isHuman) {
        res.status(400).json({ 
          error: 'Verificación reCAPTCHA fallida. Por favor demuestra que eres humano.' 
        });
        return;
      }

      console.log(req.body); 

      // Obtenemos el país usando el servicio
      const pais = await this.geolocationService.getCountryByIp(req);

      const contactData = {
        email: req.body.email,
        nombre: req.body.nombre,
        comentario: req.body.comentario,
        IpAddress: req.ip || '',
        pais: pais || 'Desconocido'
      };

      await this.contactsModel.addContact(contactData);
      
      // Enviar notificación por correo (nueva funcionalidad)
      await this.sendNotificationEmail(contactData);
      
      console.log('Body recibido:', req.body);
      res.redirect('/contact/success');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error completo:', error);
        res.status(500).json({ 
          error: 'Error saving contact', 
          details: error.message 
        });
      } else {
        res.status(500).json({ 
          error: 'Error saving contact', 
          details: 'Unknown error' 
        });
      }
    }
  };
  
  static showSuccessPage(req: Request, res: Response) {
    res.render('contact/success');
  }

  async index(req: Request, res: Response) {
    try {
      const contacts = await this.contactsModel.getAllContacts();
      console.log('Contactos obtenidos:', contacts);
      res.render('admin/contacts', { contacts });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ 
          error: 'Error fetching contacts', 
          details: error.message 
        });
      } else {
        res.status(500).json({ 
          error: 'Error fetching contacts', 
          details: 'Unknown error' 
        });
      }
    }
  }
}