import z from "zod";

export const UserUpdateDto = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    currentPassword: z.string().min(6, "Current password must be at least 6 characters long").optional(),
    password: z.string().min(6, "New password must be at least 6 characters long").optional(),
    skinFile: z.instanceof(File).optional().nullable(),
});

export type UserUpdateDtoType = z.infer<typeof UserUpdateDto>;
