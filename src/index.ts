import { Controller } from './services/controller';
import { logger } from './services/logger';

const controller = new Controller();

logger.log('Quick.tf automatic started');

controller.init();
