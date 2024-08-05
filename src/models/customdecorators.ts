import * as jf from 'joiful';
export const password1 = () =>
  jf
    .string()
    .min(8)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[!@#$%^&*(),.?":{}|<>]/)
    .required();
