import { Router } from "express";
import homeGet from "../controllers/home";
import { ContactsController } from "../controllers/ContactsController";
const contactsController = new ContactsController();

import {
  formularioMascota,
  formularioMascotaPost 
} from "../controllers/formularioMascota";

import { 
    formularioMascotaPago, 
    formularioMascotaPagoPost 
  } from "../controllers/formularioMascotaPago";


const router: Router = Router();

router.get("/", homeGet);
router.get("/formularioMascota", formularioMascota);
router.post("/formularioMascota", formularioMascotaPost);
router.get("/formularioMascotaPago", formularioMascotaPago);
router.post("/formularioMascotaPago", formularioMascotaPagoPost);

// Rutas corregidas:
router.get("/contact/add", (req, res) => res.render("formularioMascotas"));
router.post("/contact/add", contactsController.add.bind(contactsController));
router.get("/contact/success", (req, res) => res.render("contact/success"));

// Rutas de administracion
router.get('/admin/contacts', contactsController.index.bind(contactsController)) 


export default router;


