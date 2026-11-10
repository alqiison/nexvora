const nodemailer = require('nodemailer');

const API_KEY = 'rich01';

const ALLOWED_METHODS = ['POST', 'OPTIONS'];

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (!ALLOWED_METHODS.includes(req.method)) {
        res.setHeader('Allow', ALLOWED_METHODS.join(', '));

        return res.status(405).json({
            success: false,
            message: 'Method Not Allowed'
        });
    }

    let transporter;

    try {
        // Parse request body
        let data = req.body;

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: 'JSON tidak valid'
                });
            }
        }

        if (
            !data ||
            typeof data !== 'object' ||
            Array.isArray(data)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Request body tidak valid'
            });
        }

        const {
            apiKey,
            sender,
            password,
            target,
            subject,
            body
        } = data;

        // API KEY VALIDATION
        if (
            typeof apiKey !== 'string' ||
            apiKey !== API_KEY
        ) {
            return res.status(401).json({
                success: false,
                message: 'API Key Invalid'
            });
        }

        // INPUT VALIDATION
        if (
            ![sender, password, target, subject, body]
                .every(value =>
                    typeof value === 'string' &&
                    value.trim().length > 0
                )
        ) {
            return res.status(400).json({
                success: false,
                message: 'Parameter tidak lengkap atau tidak valid'
            });
        }

        // EMAIL VALIDATION
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailRegex.test(sender.trim()) ||
            !emailRegex.test(target.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: 'Format email tidak valid'
            });
        }

        // GMAIL TRANSPORTER
        transporter = nodemailer.createTransport({
            service: 'gmail',

            auth: {
                user: sender.trim(),
                pass: password
            },

            connectionTimeout: 15000,
            greetingTimeout: 10000,
            socketTimeout: 20000
        });

        // SEND EMAIL
        const info = await transporter.sendMail({
            from: sender.trim(),
            to: target.trim(),
            subject: subject.trim(),
            text: body
        });

        return res.status(200).json({
            success: true,
            message: 'Email Berhasil Terkirim!',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('[XTX EMAIL ERROR]', {
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            message: error.message
        });

        return res.status(500).json({
            success: false,
            message: 'Gagal mengirim email',
            errorCode: error.code || 'UNKNOWN_ERROR',
            error: 'Periksa konfigurasi Gmail dan Vercel Logs'
        });

    } finally {
        if (transporter) {
            transporter.close();
        }
    }
};
