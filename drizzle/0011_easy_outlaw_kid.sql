CREATE TABLE `onlineStartSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`effectiveAt` timestamp NOT NULL,
	`mode` enum('freshStart') NOT NULL DEFAULT 'freshStart',
	`noBalanceCarry` int NOT NULL DEFAULT 1,
	`noOfflineImport` int NOT NULL DEFAULT 1,
	`configuredByUserId` int NOT NULL,
	`configuredAt` timestamp NOT NULL DEFAULT (now()),
	`note` text,
	CONSTRAINT `onlineStartSettings_id` PRIMARY KEY(`id`)
);
