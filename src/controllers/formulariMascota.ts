import { Request, Response } from "express";

// archivo para importar todos los controladores
const formularioMascota = (req: Request, res: Response) => {
    res.render("formularioMascota", { data: "express" });
}

export default formularioMascota;