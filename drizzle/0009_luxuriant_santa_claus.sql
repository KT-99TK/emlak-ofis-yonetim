CREATE TABLE `officeAssistantAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assistantUserId` int NOT NULL,
	`consultantUserId` int NOT NULL,
	`assignedByUserId` int NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `officeAssistantAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `userProfiles` MODIFY COLUMN `officeRole` enum('broker_manager','consultant','office_assistant') NOT NULL DEFAULT 'consultant';