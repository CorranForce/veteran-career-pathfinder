CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('feature','bugfix','news','maintenance') NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`priority` int NOT NULL DEFAULT 0,
	`link` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	`archivedAt` timestamp,
	`createdBy` int NOT NULL,
	`createdByName` varchar(255) NOT NULL,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
