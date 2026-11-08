import { container } from "tsyringe";
import { MailService } from "./services/mail.service.js";
import { MailQueue } from "./queues/mail.queue.js";
import { MailWorker } from "./workers/mail.worker.js";

container.registerSingleton("MailService", MailService);
container.registerSingleton("MailQueue", MailQueue);
container.registerSingleton("MailWorker", MailWorker);

container.resolve("MailWorker");