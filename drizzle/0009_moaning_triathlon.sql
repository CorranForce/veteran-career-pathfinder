ALTER TABLE `purchases` ADD `amount` int NOT NULL;--> statement-breakpoint
ALTER TABLE `purchases` ADD `currency` varchar(3) DEFAULT 'USD' NOT NULL;