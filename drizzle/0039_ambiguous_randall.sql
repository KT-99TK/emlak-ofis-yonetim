CREATE TABLE `contractFormAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`attachmentType` enum('technical_specification','numbering_sketch','management_plan','power_of_attorney','signature_circular') NOT NULL,
	`title` varchar(200) NOT NULL,
	`required` int NOT NULL DEFAULT 0,
	`status` enum('missing','draft','ready','archived') NOT NULL DEFAULT 'missing',
	`storageKey` varchar(255),
	`originalFileName` varchar(255),
	`sha256` varchar(64),
	`note` text,
	`createdByUserId` int NOT NULL,
	`updatedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractFormAttachments_id` PRIMARY KEY(`id`),
	CONSTRAINT `contract_form_attachments_template_type_unique` UNIQUE(`templateId`,`attachmentType`)
);
