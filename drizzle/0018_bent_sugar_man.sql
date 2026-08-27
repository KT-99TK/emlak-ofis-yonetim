CREATE TABLE `rentalIncomeTaxProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`taxYear` int NOT NULL,
	`ownershipSharePercent` decimal(5,2) NOT NULL DEFAULT '100',
	`residentialExemptionEligible` int NOT NULL DEFAULT 0,
	`expenseMethod` enum('lump_sum','actual') NOT NULL DEFAULT 'lump_sum',
	`actualExpenseTotal` decimal(14,2) NOT NULL DEFAULT '0',
	`updatedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rentalIncomeTaxProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `rentalIncomeTaxProfiles_client_year_unique` UNIQUE(`clientId`,`taxYear`)
);
