CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`features` text NOT NULL,
	`price` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'usd',
	`stripeProductId` varchar(255),
	`stripePriceId` varchar(255),
	`status` enum('active','disabled','archived') NOT NULL DEFAULT 'active',
	`displayOrder` int NOT NULL DEFAULT 0,
	`isRecurring` boolean NOT NULL DEFAULT false,
	`billingInterval` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`archivedAt` timestamp,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
