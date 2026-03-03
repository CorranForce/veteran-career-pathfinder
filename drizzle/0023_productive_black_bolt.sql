CREATE TABLE `stripe_health_pings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('ok','degraded','error') NOT NULL,
	`latencyMs` int NOT NULL,
	`accountId` varchar(255),
	`webhookConfigured` boolean NOT NULL DEFAULT false,
	`premiumPriceValid` boolean NOT NULL DEFAULT false,
	`proPriceValid` boolean NOT NULL DEFAULT false,
	`errorMessage` text,
	`triggeredBy` enum('heartbeat','manual') NOT NULL DEFAULT 'heartbeat',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stripe_health_pings_id` PRIMARY KEY(`id`)
);
