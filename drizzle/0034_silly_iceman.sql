CREATE TABLE `referral_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`code` varchar(32) NOT NULL,
	`totalClicks` int NOT NULL DEFAULT 0,
	`totalSignups` int NOT NULL DEFAULT 0,
	`totalConversions` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_codes_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `referral_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referral_conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralCodeId` int NOT NULL,
	`referrerId` int NOT NULL,
	`refereeId` int NOT NULL,
	`purchaseId` int NOT NULL,
	`rewardCents` int NOT NULL DEFAULT 500,
	`refereeDiscountBps` int NOT NULL DEFAULT 1000,
	`refereeCouponId` varchar(255),
	`rewardStatus` enum('pending','issued','failed','reversed') NOT NULL DEFAULT 'pending',
	`rewardIssuedAt` timestamp,
	`rewardReversedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_conversions_id` PRIMARY KEY(`id`)
);
