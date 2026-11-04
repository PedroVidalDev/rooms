import z from "zod";

export const UserCreateDto = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export type UserCreateDtoType = z.infer<typeof UserCreateDto>;