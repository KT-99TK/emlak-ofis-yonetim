CREATE TABLE `localLoginCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`loginName` varchar(120) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`temporaryPasswordExpiresAt` timestamp,
	`mustChangePassword` int NOT NULL DEFAULT 1,
	`failedAttempts` int NOT NULL DEFAULT 0,
	`lockedUntil` timestamp,
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `localLoginCredentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `localLoginCredentials_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `localLoginCredentials_loginName_unique` UNIQUE(`loginName`)
);
--> statement-breakpoint
CREATE TABLE `localLoginSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	CONSTRAINT `localLoginSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `localLoginSessions_tokenHash_unique` UNIQUE(`tokenHash`)
);
