import { z } from 'zod';
export declare const RegisterSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
//# sourceMappingURL=auth.schema.d.ts.map