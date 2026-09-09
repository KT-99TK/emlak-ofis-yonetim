CREATE TABLE `commissionParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commissionTransactionId` int NOT NULL,
	`participantType` enum('consultant','externalOffice') NOT NULL,
	`side` enum('buyer','seller','shared') NOT NULL,
	`consultantUserId` int,
	`participantCode` varchar(60) NOT NULL,
	`participantName` varchar(180) NOT NULL,
	`externalOfficeName` varchar(180),
	`rate` decimal(7,4) NOT NULL,
	`share` decimal(14,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commissionParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commissionTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionNo` varchar(80) NOT NULL,
	`contractId` int,
	`netServiceFee` decimal(14,2) NOT NULL,
	`vatAmount` decimal(14,2) NOT NULL DEFAULT '0',
	`consultantShare` decimal(14,2) NOT NULL,
	`global1881Share` decimal(14,2) NOT NULL,
	`externalOfficeShare` decimal(14,2) NOT NULL DEFAULT '0',
	`status` enum('declared','managerVerified','partiallySettled','settled','cancelled') NOT NULL DEFAULT 'declared',
	`collectionReference` varchar(180) NOT NULL,
	`declaredByUserId` int NOT NULL,
	`verifiedByUserId` int,
	`verifiedAt` timestamp,
	`verificationNote` text,
	`overrideReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissionTransactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `commissionTransactions_transactionNo_unique` UNIQUE(`transactionNo`)
);
