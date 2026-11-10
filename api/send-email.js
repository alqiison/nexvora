const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Pengaturan CORS agar bisa diakses dari mana saja
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { apiKey, sender, password, target, subject, body } = req.body;

    // Set API Key rahasia kamu sendiri di sini
    if (apiKey !== 'rich01') {
        return res.status(401).json({ success: false, message: 'API Key Invalid' });
    }

    if (!sender  !password  !target  !subject  !body) {
        return res.status(400).json({ success: false, message: 'Parameter tidak lengkap!' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: sender,
                pass: password
            }
        });

        await transporter.sendMail({
            from: sender,
            to: target,
            subject: subject,
            text: body
        });

        return res.status(200).json({ success: true, message: 'Email Berhasil Terkirim!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
