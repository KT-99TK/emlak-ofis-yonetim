ALTER TABLE `contractFormClauses` ADD `requesterDisplayName` varchar(200);--> statement-breakpoint
ALTER TABLE `contractFormClauses` ADD `includeRequesterFootnote` int DEFAULT 1 NOT NULL;