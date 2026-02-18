CREATE TABLE `admin_activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`adminName` varchar(255) NOT NULL,
	`adminEmail` varchar(320) NOT NULL,
	`targetUserId` int,
	`targetUserName` varchar(255),
	`targetUserEmail` varchar(320),
	`actionType` enum('suspend_user','reactivate_user','delete_user','change_role','view_purchases','update_product','other') NOT NULL,
	`description` text NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_activity_logs_id` PRIMARY KEY(`id`)
);
