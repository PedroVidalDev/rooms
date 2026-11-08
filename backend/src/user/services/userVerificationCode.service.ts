import crypto from "crypto";
import bcrypt from "bcrypt";
import { inject, injectable } from "tsyringe";
import { MailQueue } from "../../mail/queues/mail.queue.js";
import { User } from "../entities/user.entity.js";
import { UserVerificationCode } from "../entities/userVerificationCode.entity.js";
import { UserVerificationCodeRepository } from "../repositories/userVerificationCode.repository.js";

const EXPIRATION_MINUTES = 30;

@injectable()
export class UserVerificationCodeService {
    constructor(
        @inject("UserVerificationCodeRepository")
        private readonly userVerificationCodeRepository: UserVerificationCodeRepository,
        @inject("MailQueue")
        private readonly mailQueue: MailQueue
    ) {}

    public async sendVerificationCode(user: User): Promise<void> {
        const userId = user.getId();
        if (!userId) {
            throw new Error("User ID is required to generate a verification code");
        }

        await this.userVerificationCodeRepository.invalidateUserCodes(userId);

        const code = crypto.randomInt(100000, 1000000).toString();
        const hashedCode = await bcrypt.hash(code, 10);
        const now = new Date();
        const expiresAt = new Date(now.getTime() + EXPIRATION_MINUTES * 60 * 1000);

        const verificationCode = new UserVerificationCode(
            null,
            userId,
            hashedCode,
            false,
            expiresAt,
            now
        );

        await this.userVerificationCodeRepository.create(verificationCode);

        await this.mailQueue.addMailJob({
            to: user.getEmail(),
            subject: "Your Verification Code - Rooms",
            text: `Hello ${user.getName()}, your verification code is: ${code}. It will expire in ${EXPIRATION_MINUTES} minutes.`,
            html: `<h1>Hello, ${user.getName()}!</h1><p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in ${EXPIRATION_MINUTES} minutes.</p>`,
        });
    }

    public async verifyUserCode(userId: number, code: string): Promise<void> {
        const verificationCode = await this.userVerificationCodeRepository.findBy({
            userId,
            used: false,
        });

        if (!verificationCode || !verificationCode.getId()) {
            throw new Error("Verification code not found");
        }

        if (verificationCode.isExpired()) {
            throw new Error("Verification code has expired");
        }

        const isCodeValid = await bcrypt.compare(code, verificationCode.getHashedCode());
        if (!isCodeValid) {
            throw new Error("Invalid verification code");
        }

        await this.userVerificationCodeRepository.update(verificationCode.getId()!, {
            used: true,
        });
    }
}
