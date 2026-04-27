CREATE TABLE `exit_intent_captures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`couponCode` varchar(100) NOT NULL DEFAULT '5zlB9zup',
	`emailSent` boolean NOT NULL DEFAULT false,
	`emailSentAt` timestamp,
	`convertedAt` timestamp,
	`ipHash` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exit_intent_captures_id` PRIMARY KEY(`id`)
);
