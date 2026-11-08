import { inject, injectable } from "tsyringe";
import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis.config.js";
import { MAIL_QUEUE_NAME } from "../queues/mail.queue.js";
import { SendMailOptions } from "../interfaces/mail.interface.js";
import { MailService } from "../services/mail.service.js";

@injectable()
export class MailWorker {
    private worker: Worker<SendMailOptions>;

    constructor(
        @inject("MailService")
        private readonly mailService: MailService
    ) {
        this.worker = new Worker<SendMailOptions>(
            MAIL_QUEUE_NAME,
            async (job: Job<SendMailOptions>) => {
                await this.mailService.sendMail(job.data);
            },
            {
                connection: redisConnection,
                concurrency: 5,
            }
        );

        this.worker.on("completed", (job) => {
            console.log(`[MailWorker] Email sent to ${job.data.to} (Job ID: ${job.id})`);
        });

        this.worker.on("failed", (job, err) => {
            console.error(`[MailWorker] Failed to send email to ${job?.data.to}:`, err.message);
        });
    }
}