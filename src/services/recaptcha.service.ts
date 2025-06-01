import axios from 'axios';

interface RecaptchaResponse {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    'error-codes'?: string[];
}

export class RecaptchaService {
    private readonly SECRET_KEY: string;
    private readonly VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

    constructor() {
        if (!process.env.RECAPTCHA_SECRET_KEY) {
            throw new Error('RECAPTCHA_SECRET_KEY no está configurada');
        }
        this.SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
    }

    async verifyToken(token: string): Promise<boolean> {
        try {
            const params = new URLSearchParams();
            params.append('secret', this.SECRET_KEY);
            params.append('response', token);

            const response = await axios.post(
                this.VERIFY_URL,
                params,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );
            console.log("Respuesta de Google:", response.data);

            const data = response.data as RecaptchaResponse;
            return data.success;
        } catch (error) {
            console.error('Error al verificar reCAPTCHA:', error);
            return false;
        }
    }
}
