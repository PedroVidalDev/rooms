import { UserModel } from "../../generated/prisma/models.js";
import { UserDtoType } from "../dtos/user.dto.js";

export class User {
    private id: number | null;
    private name: string;
    private email: string;
    private skinUrl: string | null;
    private password: string;
    private createdAt: Date;
    private updatedAt: Date;
    private deletedAt: Date | null;
    private isActive: boolean;
    private isVerified: boolean;

    constructor(id: number | null, name: string, email: string, skinUrl: string | null, password: string, createdAt: Date, updatedAt: Date, deletedAt: Date | null, isActive: boolean, isVerified: boolean) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.skinUrl = skinUrl;
        this.password = password;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.isActive = isActive;
        this.isVerified = isVerified;
    }

    public getId(): number | null {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getEmail(): string {
        return this.email;
    }

    public getSkinUrl(): string | null {
        return this.skinUrl;
    }

    public getPassword(): string {
        return this.password;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    public getDeletedAt(): Date | null {
        return this.deletedAt;
    }

    public getIsActive(): boolean {
        return this.isActive;
    }

    public getIsVerified(): boolean {
        return this.isVerified;
    }

    public toDto(): UserDtoType {
        return {
            name: this.name,
            email: this.email,
            skinUrl: this.skinUrl,
        };
    }

    public static fromModel(model: UserModel): User {
        return new User(
            model.id,
            model.name,
            model.email,
            model.skinUrl,
            model.password,
            model.createdAt,
            model.updatedAt,
            model.deletedAt,
            model.isActive,
            model.isVerified
        );
    }
}