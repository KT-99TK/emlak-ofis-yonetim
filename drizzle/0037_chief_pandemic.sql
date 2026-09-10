CREATE TABLE `contractPreparationChecks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`draftKey` varchar(120) NOT NULL,
	`formType` enum('sale_closing','land_share') NOT NULL,
	`checklistJson` text NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	`createdByUserId` int NOT NULL,
	`updatedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractPreparationChecks_id` PRIMARY KEY(`id`),
	CONSTRAINT `contractPreparationChecks_draftKey_unique` UNIQUE(`draftKey`)
);
