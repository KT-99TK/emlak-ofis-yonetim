ALTER TABLE `clients` ADD `referenceNo` varchar(40);--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_referenceNo_unique` UNIQUE(`referenceNo`);