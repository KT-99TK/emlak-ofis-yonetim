CREATE TABLE `personalTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`notes` text,
	`priority` enum('low','normal','high') NOT NULL DEFAULT 'normal',
	`status` enum('open','done','cancelled') NOT NULL DEFAULT 'open',
	`dueAt` timestamp,
	`reminderAt` timestamp,
	`completedAt` timestamp,
	`linkedEntityType` varchar(40),
	`linkedEntityId` int,
	`linkedLabel` varchar(240),
	`linkedPath` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personalTasks_id` PRIMARY KEY(`id`)
);
