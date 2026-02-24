CREATE TABLE `blog_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`subscribeToNewPosts` boolean NOT NULL DEFAULT true,
	`subscribeToFeatures` boolean NOT NULL DEFAULT true,
	`subscribeToBugFixes` boolean NOT NULL DEFAULT true,
	`status` enum('active','unsubscribed','bounced') NOT NULL DEFAULT 'active',
	`isVerified` boolean NOT NULL DEFAULT false,
	`verificationToken` varchar(255),
	`verificationTokenExpiry` timestamp,
	`unsubscribeToken` varchar(255) NOT NULL,
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	`verifiedAt` timestamp,
	`unsubscribedAt` timestamp,
	`lastEmailSentAt` timestamp,
	CONSTRAINT `blog_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_subscribers_email_unique` UNIQUE(`email`)
);
