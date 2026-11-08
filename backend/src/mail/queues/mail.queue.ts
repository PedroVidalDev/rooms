import { injectable } from "tsyringe";
import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.config.js";
import { SendMailOptions } from "../interfaces/mail.interface.js";

export const MAIL_QUEUE_NAME = "mail-queue";

@injectable()
export class MailQueue {
    private queue: Queue<SendMailOptions>;

    constructor() {
        this.queue = new Queue<SendMailOptions>(MAIL_QUEUE_NAME, {
            connection: redisConnection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            },
        });
    }

    public async addMailJob(data: SendMailOptions): Promise<void> {
        await this.queue.add("send-email", data);
    }
}