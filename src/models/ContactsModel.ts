import { initDB } from '../database/database';

interface contactos {
  id?: number;
  nombre: string;
  email: string;
  comentario: string;
  IpAddress: string;
  pais?: string; // Nuevo campo opcional
  creado_en?: string;
}

export class ContactsModel {
  async addContact(contactos: contactos): Promise<void> {
    const db = await initDB();
    const stmt = await db.prepare(`
      INSERT INTO contactos (email, nombre, comentario, IpAddress, pais, creado_en)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    await stmt.run([
      contactos.email, 
      contactos.nombre, 
      contactos.comentario, 
      contactos.IpAddress,
      contactos.pais || null // Si no viene país, se guarda como NULL
    ]);
    await stmt.finalize();
  }

  async getAllContacts(): Promise<contactos[]> {
    try {
      const db = await initDB();
      const contacts = await db.all('SELECT * FROM contactos ORDER BY creado_en DESC');
      return contacts;
    } catch (error) {
      console.error('Error en getAllContacts:', error);
      throw error;
    }
  }
}
