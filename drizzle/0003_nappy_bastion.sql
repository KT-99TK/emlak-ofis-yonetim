ALTER TABLE `contracts` ADD `evictionNoticeDays` int;--> statement-breakpoint
ALTER TABLE `contracts` ADD `evictionNoticeDate` timestamp;--> statement-breakpoint
ALTER TABLE `contracts` ADD `ownerApprovalStatus` enum('notRequired','pending','approved','rejected') DEFAULT 'notRequired' NOT NULL;--> statement-breakpoint
ALTER TABLE `contracts` ADD `ownerApprovalDate` timestamp;--> statement-breakpoint
ALTER TABLE `contracts` ADD `ownerApprovalNote` text;