CREATE TABLE `civilian_career_paths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mosId` int NOT NULL,
	`jobTitle` varchar(255) NOT NULL,
	`industry` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`salaryMin` int NOT NULL,
	`salaryMax` int NOT NULL,
	`salaryMedian` int,
	`transitionDifficulty` enum('easy','moderate','challenging') NOT NULL,
	`timeToHireMonths` int,
	`requiredCerts` text NOT NULL,
	`recommendedCerts` text,
	`transferableSkills` text NOT NULL,
	`skillsGap` text,
	`exampleEmployers` text,
	`isTopPath` boolean NOT NULL DEFAULT false,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `civilian_career_paths_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mos_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`branch` enum('army','navy','air_force','marine_corps','coast_guard','space_force') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`keySkills` text NOT NULL,
	`searchKeywords` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mos_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `mos_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `mos_translator_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`mosCode` varchar(20) NOT NULL,
	`branch` varchar(50),
	`ipHash` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mos_translator_sessions_id` PRIMARY KEY(`id`)
);
