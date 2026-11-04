export class User {
    private id: number;
    private name: string;
    private email: string;
    private password: string;
    private createdAt: Date;
    private updatedAt: Date;
    private deletedAt: Date | null;
    private isActive: boolean;
    private isVerified: boolean;

    constructor(id: number, name: string, email: string, password: string, createdAt: Date, updatedAt: Date, deletedAt: Date | null, isActive: boolean, isVerified: boolean) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.isActive = isActive;
        this.isVerified = isVerified;
    }

    public getId(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getEmail(): string {
        return this.email;
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
}