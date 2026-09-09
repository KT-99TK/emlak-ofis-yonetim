ALTER TABLE `commissionTransactions` ADD `originatingConsultantPayout` decimal(14,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `fulfillingConsultantPayout` decimal(14,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `rightsOfficePayout` decimal(14,2) DEFAULT '0' NOT NULL;
ALTER TABLE `commissionTransactions` ADD `rightsOfficePayout` decimal(14,2) DEFAULT '0' NOT NULL;
