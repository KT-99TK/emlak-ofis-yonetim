CREATE TABLE `portfolioRightsTransfers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`propertyId` int,
	`originatingConsultantUserId` int NOT NULL,
	`fulfillingConsultantUserId` int,
	`rightsOwnerType` enum('consultant','office') NOT NULL DEFAULT 'consultant',
	`effectiveFrom` timestamp NOT NULL,
	`effectiveTo` timestamp,
	`reason` varchar(1000) NOT NULL,
	`status` enum('pending','approved','cancelled') NOT NULL DEFAULT 'pending',
	`approvedByUserId` int,
	`approvedAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolioRightsTransfers_id` PRIMARY KEY(`id`)
);
