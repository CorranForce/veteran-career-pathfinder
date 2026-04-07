CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(300) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`coverImageUrl` text,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`authorId` int NOT NULL,
	`authorName` varchar(255) NOT NULL,
	`metaTitle` varchar(255),
	`metaDescription` text,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `platform_agent_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trigger` enum('scheduled','manual') NOT NULL DEFAULT 'scheduled',
	`actions` text NOT NULL,
	`stripeLatencyMs` int,
	`stripeStatus` enum('ok','degraded','error','skipped') NOT NULL DEFAULT 'skipped',
	`announcementsArchived` int NOT NULL DEFAULT 0,
	`errors` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `platform_agent_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `announcements` ADD `visibleOnLandingPage` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `announcements` ADD `landingPageExpiresAt` timestamp;