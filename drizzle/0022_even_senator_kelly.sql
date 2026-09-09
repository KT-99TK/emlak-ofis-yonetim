ALTER TABLE `commissionTransactions` ADD `discountAmount` decimal(14,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `collectedAmount` decimal(14,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `cancelReason` text;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `settledAt` timestamp;