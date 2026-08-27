CREATE TABLE `brokerGuidanceNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` enum('rental_service','contract_review','collection','general') NOT NULL,
	`summary` varchar(280) NOT NULL,
	`status` enum('open','resolved') NOT NULL DEFAULT 'open',
	`createdByUserId` int NOT NULL,
	`resolvedByUserId` int,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brokerGuidanceNotes_id` PRIMARY KEY(`id`)
);
