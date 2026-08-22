CREATE TABLE `backupManifests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdByUserId` int NOT NULL,
	`storageKey` varchar(255) NOT NULL,
	`checksum` varchar(128) NOT NULL,
	`schemaVersion` varchar(30) NOT NULL,
	`recordCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backupManifests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminderPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`leadDays` varchar(80) NOT NULL DEFAULT '30,14,7,3,1',
	`inAppEnabled` int NOT NULL DEFAULT 1,
	`emailEnabled` int NOT NULL DEFAULT 0,
	CONSTRAINT `reminderPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `reminderPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `rentalObligations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int,
	`propertyId` int,
	`clientId` int,
	`assignedUserId` int,
	`obligationType` enum('rent','tax','insurance','other') NOT NULL,
	`title` varchar(180) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`paidAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`status` enum('planned','due','paid','overdue','cancelled') NOT NULL DEFAULT 'planned',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rentalObligations_id` PRIMARY KEY(`id`)
);
