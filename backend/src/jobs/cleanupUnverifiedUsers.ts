import cron from 'node-cron';
import { prisma } from '../db';

export function startCleanupJob() {
  cron.schedule('0 0 * * *', async () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const deleted = await prisma.user.deleteMany({
      where: {
        isEmailVerified: false,
        createdAt: {
          lt: oneDayAgo,
        },
      },
    });
    console.log(`Cleaned up ${deleted.count} unverified accounts`);
  });
}
