CREATE TABLE `contractFormClauses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`partyScope` enum('shared','seller','buyer','landowner','contractor') NOT NULL,
	`title` varchar(200) NOT NULL,
	`bodyTemplate` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`sourceNote` varchar(500),
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractFormClauses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractFormFields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`sectionId` int,
	`fieldKey` varchar(100) NOT NULL,
	`label` varchar(200) NOT NULL,
	`fieldType` enum('text','multiline','date','currency','number','checkbox','select') NOT NULL,
	`partyScope` enum('shared','seller','buyer','landowner','contractor') NOT NULL DEFAULT 'shared',
	`optionsJson` text,
	`required` int NOT NULL DEFAULT 0,
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractFormFields_id` PRIMARY KEY(`id`),
	CONSTRAINT `contract_form_fields_template_key_unique` UNIQUE(`templateId`,`fieldKey`)
);
--> statement-breakpoint
CREATE TABLE `contractFormInstances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`templateId` int NOT NULL,
	`revision` int NOT NULL DEFAULT 1,
	`fieldValuesJson` text NOT NULL,
	`selectedClauseIdsJson` text NOT NULL,
	`status` enum('draft','review','approved','signed','archived') NOT NULL DEFAULT 'draft',
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractFormInstances_id` PRIMARY KEY(`id`),
	CONSTRAINT `contract_form_instances_contract_revision_unique` UNIQUE(`contractId`,`revision`)
);
--> statement-breakpoint
CREATE TABLE `contractFormSections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`sectionKey` varchar(80) NOT NULL,
	`sectionType` enum('general','technical','optional_clauses') NOT NULL,
	`title` varchar(200) NOT NULL,
	`contentTemplate` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractFormSections_id` PRIMARY KEY(`id`),
	CONSTRAINT `contract_form_sections_template_key_unique` UNIQUE(`templateId`,`sectionKey`)
);
--> statement-breakpoint
CREATE TABLE `contractFormTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formType` enum('sale_closing','land_share') NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`status` enum('draft','review','published','archived') NOT NULL DEFAULT 'draft',
	`title` varchar(200) NOT NULL,
	`legalReviewNote` text,
	`createdByUserId` int NOT NULL,
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractFormTemplates_id` PRIMARY KEY(`id`),
	CONSTRAINT `contract_form_templates_type_version_unique` UNIQUE(`formType`,`version`)
);
