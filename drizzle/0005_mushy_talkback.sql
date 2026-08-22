ALTER TABLE `reminderPreferences` ADD `scheduleCronTaskUid` varchar(65);--> statement-breakpoint
ALTER TABLE `reminderPreferences` ADD `lastReminderRunKey` varchar(80);--> statement-breakpoint
ALTER TABLE `reminderPreferences` ADD CONSTRAINT `reminderPreferences_scheduleCronTaskUid_unique` UNIQUE(`scheduleCronTaskUid`);