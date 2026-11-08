import z from "zod";

export const VerifyCodeDto = z.object({
    email: z.string().email("Invalid email address"),
    code: z.string().regex(/^\d{6}$/, "Verification code must be 6 digits"),
});

export type VerifyCodeDtoType = z.infer<typeof VerifyCodeDto>;
