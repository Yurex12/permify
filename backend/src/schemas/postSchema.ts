import * as z from 'zod';

export const postSchema = z.object({
  content: z
    .string()
    .nonempty('Post content is required')
    .max(5000, 'Post content should be less than 5000 characters'),
});

export type PostFormValues = z.infer<typeof postSchema>;
