import cron from 'node-cron';
import { prisma } from '../db';

export function startCleanupJob() {
  cron.schedule('0 0 * * *', async () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const deleted = await prisma.user.deleteMany({
        where: {
          isEmailVerified: false,
          createdAt: {
            lt: oneDayAgo,
          },
        },
      });
      console.log(`Cleaned up ${deleted.count} unverified accounts`);
    } catch (error) {
      console.error('Failed to clean up unverified accounts', error);
    }
  });
}
