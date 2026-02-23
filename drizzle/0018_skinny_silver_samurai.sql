ALTER TABLE `users` ADD `newEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `users` ADD `emailChangeToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailChangeTokenExpiry` timestamp;