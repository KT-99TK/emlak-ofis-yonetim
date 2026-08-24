CREATE TABLE `treasuryCashDailyCounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`controlDate` timestamp NOT NULL,
	`openingCash` decimal(14,2) NOT NULL DEFAULT '0',
	`countedCash` decimal(14,2),
	`closedByUserId` int NOT NULL,
	`managerVerifiedAt` timestamp NOT NULL DEFAULT (now()),
	`note` text,
	CONSTRAINT `treasuryCashDailyCounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `treasuryCashMovements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`movementType` enum('bankToCash','cashExpense','cashReceipt','cashDeposit','other') NOT NULL,
	`direction` enum('in','out') NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`occurredOn` timestamp NOT NULL,
	`counterparty` varchar(180) NOT NULL,
	`evidenceReference` varchar(180) NOT NULL,
	`note` text,
	`status` enum('declared','managerVerified','reconciled','voided') NOT NULL DEFAULT 'declared',
	`enteredByUserId` int NOT NULL,
	`verifiedByUserId` int,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `treasuryCashMovements_id` PRIMARY KEY(`id`)
);
