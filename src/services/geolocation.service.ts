import axios from 'axios';
import { Request } from 'express';

export class GeolocationService {
    private readonly API_KEY = process.env.IPSTACK_API_KEY || '6b2808aaf18accb47ff0f55ff319';
    private readonly API_URL = 'http://api.ipstack.com/';

    async getCountryByIp(req: Request): Promise<string | null> {
        try {
            const clientIp = this.getClientIp(req);
            
            // Si es una IP local (desarrollo), devolver un valor por defecto o null
            if (!clientIp || clientIp === '::1' || clientIp === '127.0.0.1') {
                return 'Localhost (Desarrollo)';
            }

            const response = await axios.get(
                `${this.API_URL}${clientIp}?access_key=${this.API_KEY}`
            );

            return response.data as string || null;
        } catch (error) {
            console.error('Error al obtener geolocalización:', error);
            return null;
        }
    }

    private getClientIp(req: Request): string | null {
        // Obtener IP de varias fuentes posibles
        return (req.ip || 
                req.headers['x-forwarded-for']?.toString().split(',')[0] || 
                req.socket.remoteAddress)?.toString() || null;
    }
}