import { prisma } from '../db';

// Generates a unique username from the user's first and last name.
// Format: {firstname}{lastname}{4-digit suffix}, e.g. "janedoe4521"
// Non-alphanumeric characters are stripped from the name parts.
// Retries up to 10 times with a new random suffix on collision.
export async function generateUniqueUsername(
  firstName: string,
  lastName: string
): Promise<string> {
  const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    const candidate = `${base}${suffix}`;

    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { userId: true },
    });

    if (!existing) return candidate;
  }

  throw new Error(
    `Could not generate a unique username for "${firstName} ${lastName}" after 10 attempts`
  );
}
