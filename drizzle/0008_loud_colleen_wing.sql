CREATE TABLE `contractDocumentParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`clientId` int NOT NULL,
	`partyRole` enum('primary','propertyOwner','tenant','other') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contractDocumentParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contractDocuments` ADD `documentType` varchar(40);--> statement-breakpoint
ALTER TABLE `contractDocuments` ADD `documentDate` timestamp;--> statement-breakpoint
ALTER TABLE `contractDocuments` ADD `historicalActivity` text;--> statement-breakpoint
ALTER TABLE `contractDocuments` ADD `archiveNote` text;