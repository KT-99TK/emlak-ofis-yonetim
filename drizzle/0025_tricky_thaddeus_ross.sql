CREATE TABLE `consultantAgreementProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consultantSharePercent` decimal(5,2) NOT NULL DEFAULT '60',
	`officeSharePercent` decimal(5,2) NOT NULL DEFAULT '40',
	`monthlyDeskFee` decimal(14,2) NOT NULL DEFAULT '0',
	`validFrom` timestamp NOT NULL,
	`validTo` timestamp,
	`status` enum('draft','active','expired','cancelled') NOT NULL DEFAULT 'draft',
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`note` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultantAgreementProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `agreementProfileId` int;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `snapshotConsultantSharePercent` decimal(5,2) DEFAULT '60' NOT NULL;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `snapshotOfficeSharePercent` decimal(5,2) DEFAULT '40' NOT NULL;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `snapshotMonthlyDeskFee` decimal(14,2) DEFAULT '0' NOT NULL;