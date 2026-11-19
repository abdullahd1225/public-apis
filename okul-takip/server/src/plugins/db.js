import fp from 'fastify-plugin';
import mongoose from 'mongoose';
import { config } from '../config/index.js';

export default fp(async (app) => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  app.log.info(`MongoDB bağlandı: ${config.mongoUri}`);
  app.addHook('onClose', async () => mongoose.disconnect());
});
