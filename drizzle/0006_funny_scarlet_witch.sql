CREATE TABLE `careerHighlights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('achievement','certification','promotion','project','award','skill') NOT NULL,
	`date` date,
	`imageUrl` text,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `careerHighlights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bio` text,
	`linkedinUrl` varchar(500),
	`linkedinUsername` varchar(255),
	`profileImageUrl` text,
	`currentRole` varchar(255),
	`targetRole` varchar(255),
	`yearsOfExperience` int,
	`militaryBranch` varchar(100),
	`militaryRank` varchar(100),
	`profileVisibility` enum('public','private','members_only') NOT NULL DEFAULT 'members_only',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProfiles_userId_unique` UNIQUE(`userId`)
);
