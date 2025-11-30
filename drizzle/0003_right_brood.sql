CREATE TABLE `email_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriberId` int,
	`email` varchar(320) NOT NULL,
	`eventType` varchar(50) NOT NULL,
	`timestamp` timestamp NOT NULL,
	`url` text,
	`userAgent` text,
	`ip` varchar(45),
	`sgEventId` varchar(255),
	`sgMessageId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_events_id` PRIMARY KEY(`id`)
);
