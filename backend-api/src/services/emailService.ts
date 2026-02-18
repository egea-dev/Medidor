import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmailWithAttachment = async (to: string, subject: string, text: string, filename: string, content: Buffer) => {
    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'Medidor Egea <noreply@medidor-egea.com>',
        to,
        subject,
        text,
        attachments: [
            {
                filename,
                content,
                contentType: 'application/pdf',
            },
        ],
    });
    return info;
};
