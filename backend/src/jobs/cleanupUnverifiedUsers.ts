import cron from 'node-cron';
import { prisma } from '../db';

export function startCleanupJob() {
  cron.schedule('0 0 * * *', async () => {
    try {
      const deleted = await prisma.user.deleteMany({
        where: {
          isEmailVerified: false,
          emailVerifyTokenExpiresAt: {
            lt: new Date(),
          },
        },
      });
      console.log(`Cleaned up ${deleted.count} unverified accounts`);
    } catch (error) {
      console.error('Failed to clean up unverified accounts', error);
    }
  });
}
