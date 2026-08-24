CREATE TABLE `contractDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int,
	`clientId` int,
	`assignedUserId` int NOT NULL,
	`category` enum('activeSigned','archive') NOT NULL,
	`originalFileName` varchar(255) NOT NULL,
	`storageKey` varchar(255) NOT NULL,
	`sha256` varchar(64) NOT NULL,
	`byteSize` int NOT NULL,
	`immutable` int NOT NULL DEFAULT 1,
	`createdByUserId` int NOT NULL,
	`invalidatedAt` timestamp,
	`invalidationReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contractDocuments_id` PRIMARY KEY(`id`),
	CONSTRAINT `contractDocuments_storageKey_unique` UNIQUE(`storageKey`)
);
