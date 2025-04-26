import { Router } from "express";
import homeGet from "../controllers/home";
import formulariMascota from "../controllers/formulariMascota";


const router: Router = Router();

router.get("/", homeGet);

router.get("/formulario-mascota", formulariMascota);

export default router;


