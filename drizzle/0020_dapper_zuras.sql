CREATE TABLE `sensitiveFieldVault` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` varchar(60) NOT NULL,
	`entityId` int NOT NULL,
	`fieldPath` varchar(180) NOT NULL,
	`ciphertext` text NOT NULL,
	`iv` varchar(32) NOT NULL,
	`authTag` varchar(32) NOT NULL,
	`keyVersion` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sensitiveFieldVault_id` PRIMARY KEY(`id`),
	CONSTRAINT `sensitive_vault_entity_field_unique` UNIQUE(`entityType`,`entityId`,`fieldPath`)
);
