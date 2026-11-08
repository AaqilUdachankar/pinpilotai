import { MongoMemoryServer } from 'mongodb-memory-server';

console.log('Testing MongoMemoryServer with extended timeout...');
try {
  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'pinpilot',
    },
    spawn: {
      timeout: 60000,
    },
    binary: {
      downloadDir: 'e:\\Fullstack projects\\PinPilot\\backend\\.mongodb-binaries',
    }
  });
  console.log('MongoMemoryServer started successfully! URI:', mongod.getUri());
  await mongod.stop();
  process.exit(0);
} catch (err) {
  console.log('MongoMemoryServer result:', err.message);
  process.exit(1);
}
