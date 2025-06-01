export {};

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';


// Configuración de la base de datos
export const initDB = async () => {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });
  
   // ...existing code...
    // Crear tabla si no existe
    await db.exec(`
      CREATE TABLE IF NOT EXISTS contactos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT NOT NULL,
        comentario TEXT,
        IpAddress TEXT,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Intentar agregar el campo 'pais' si no existe
    try {
      await db.exec(`ALTER TABLE contactos ADD COLUMN pais TEXT;`);
    } catch (error) {
      // Si el campo ya existe, ignorar el error
      if (!String(error).includes('duplicate column name')) {
        throw error;
      }
    }

    // Crear tabla si no existe
    await db.exec(`
        CREATE TABLE IF NOT EXISTS pagos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          nombre TEXT NOT NULL,
          numerotarjeta INTEGER NOT NULL,
          fechavencimientom INTEGER NOT NULL,
          fechavencimientoy INTEGER NOT NULL,
          cvv INTEGER NOT NULL,
          monto INTEGER NOT NULL,
          tipopago TEXT NOT NULL,
          creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
// ...existing code...
      
  
    console.log('Base de datos SQLite inicializada');
    return db;
  };