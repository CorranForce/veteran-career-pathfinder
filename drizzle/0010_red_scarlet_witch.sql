CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activityType` enum('user_signup','resume_upload','purchase','template_download') NOT NULL,
	`userId` int,
	`userName` varchar(255),
	`userEmail` varchar(320),
	`description` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
