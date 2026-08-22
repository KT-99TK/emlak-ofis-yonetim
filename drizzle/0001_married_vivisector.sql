CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorUserId` int NOT NULL,
	`action` varchar(80) NOT NULL,
	`entityType` varchar(60) NOT NULL,
	`entityId` int,
	`summary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('individual','company') NOT NULL DEFAULT 'individual',
	`name` varchar(180) NOT NULL,
	`identityOrTaxNo` varchar(40),
	`phone` varchar(40),
	`email` varchar(320),
	`address` text,
	`assignedUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractNo` varchar(60) NOT NULL,
	`type` enum('rental','sale','authority') NOT NULL,
	`subtype` varchar(80),
	`status` enum('draft','review','approved','signed','active','completed','cancelled') NOT NULL DEFAULT 'draft',
	`version` int NOT NULL DEFAULT 1,
	`title` varchar(200) NOT NULL,
	`clientId` int,
	`propertyId` int,
	`assignedUserId` int,
	`startDate` timestamp,
	`endDate` timestamp,
	`amount` decimal(14,2),
	`currency` varchar(8) NOT NULL DEFAULT 'TRY',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contracts_contractNo_unique` UNIQUE(`contractNo`)
);
--> statement-breakpoint
CREATE TABLE `ledgerEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entryType` enum('income','expense','receivable','payable') NOT NULL,
	`status` enum('pending','partial','paid','cancelled') NOT NULL DEFAULT 'pending',
	`description` varchar(240) NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`paidAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`dueDate` timestamp,
	`contractId` int,
	`clientId` int,
	`assignedUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ledgerEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referenceNo` varchar(40) NOT NULL,
	`type` enum('residential','commercial','land','office') NOT NULL DEFAULT 'residential',
	`listingType` enum('sale','rent') NOT NULL DEFAULT 'sale',
	`title` varchar(180) NOT NULL,
	`address` text NOT NULL,
	`district` varchar(100),
	`grossM2` decimal(10,2),
	`roomCount` varchar(30),
	`price` decimal(14,2),
	`ownerClientId` int,
	`assignedUserId` int,
	`status` enum('active','reserved','closed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `properties_id` PRIMARY KEY(`id`),
	CONSTRAINT `properties_referenceNo_unique` UNIQUE(`referenceNo`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`managerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`teamId` int,
	`managerId` int,
	`officeRole` enum('broker_manager','consultant') NOT NULL DEFAULT 'consultant',
	`consultantCode` varchar(40),
	`phone` varchar(40),
	`title` varchar(120),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProfiles_userId_unique` UNIQUE(`userId`)
);
