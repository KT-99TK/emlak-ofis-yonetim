ALTER TABLE `commissionTransactions` ADD `portfolioRightsPolicy` enum('individualConsultant','corporateOffice') DEFAULT 'individualConsultant' NOT NULL;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `originatingConsultantUserId` int;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `fulfillingConsultantUserId` int;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `consultantRightsSplitPercent` decimal(5,2) DEFAULT '50' NOT NULL;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `corporateOfficePaysConsultant` int DEFAULT 1 NOT NULL;