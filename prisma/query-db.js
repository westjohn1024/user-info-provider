// Simple script to query the last record from the UserInfo table
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getLastRecord() {
  try {
    const lastRecord = await prisma.userInfo.findFirst({
      orderBy: {
        visitedAt: 'desc',
      },
    });
    
    console.log('Last collected user information:');
    console.log(JSON.stringify(lastRecord, null, 2));
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getLastRecord(); 