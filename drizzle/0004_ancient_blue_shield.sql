CREATE TABLE `ab_test_variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`variantName` varchar(100) NOT NULL,
	`subject` text NOT NULL,
	`weight` int NOT NULL DEFAULT 50,
	`isWinner` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ab_test_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drip_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` text NOT NULL,
	`htmlContent` text NOT NULL,
	`textContent` text NOT NULL,
	`dayOffset` int NOT NULL,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drip_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drip_sends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriberId` int NOT NULL,
	`campaignId` int NOT NULL,
	`sentAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `drip_sends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriber_segments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscriberId` int NOT NULL,
	`segment` enum('active','inactive','highly_engaged','cold_lead') NOT NULL,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriber_segments_id` PRIMARY KEY(`id`)
);
