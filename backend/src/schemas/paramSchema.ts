import * as z from 'zod';

export const paramSchema = z.object({
  id: z.uuid('Please provide an id'),
});
