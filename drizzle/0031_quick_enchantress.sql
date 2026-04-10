ALTER TABLE `platform_agent_logs` ADD `driftCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `platform_agent_logs` ADD `driftMode` varchar(10);--> statement-breakpoint
ALTER TABLE `platform_agent_logs` ADD `driftCheckedAt` timestamp;