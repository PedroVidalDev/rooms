import { UserVerificationCodeModel } from "../../generated/prisma/models.js";

export class UserVerificationCode {
    private id: number | null;
    private userId: number;
    private hashedCode: string;
    private used: boolean;
    private expiresAt: Date;
    private createdAt: Date;

    constructor(
        id: number | null,
        userId: number,
        hashedCode: string,
        used: boolean,
        expiresAt: Date,
        createdAt: Date
    ) {
        this.id = id;
        this.userId = userId;
        this.hashedCode = hashedCode;
        this.used = used;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    public getId(): number | null {
        return this.id;
    }

    public getUserId(): number {
        return this.userId;
    }

    public getHashedCode(): string {
        return this.hashedCode;
    }

    public getUsed(): boolean {
        return this.used;
    }

    public getExpiresAt(): Date {
        return this.expiresAt;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    public static fromModel(model: UserVerificationCodeModel): UserVerificationCode {
        return new UserVerificationCode(
            model.id,
            model.userId,
            model.hashedCode,
            model.used,
            model.expiresAt,
            model.createdAt
        );
    }
}
