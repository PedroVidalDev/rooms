import { injectable } from "tsyringe";
import nodemailer, { Transporter } from "nodemailer";
import { SendMailOptions } from "../interfaces/mail.interface.js";

@injectable()
export class MailService {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    public async sendMail({ to, subject, html, text }: SendMailOptions): Promise<void> {
        await this.transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to,
            subject,
            text,
            html,
        });
    }
}