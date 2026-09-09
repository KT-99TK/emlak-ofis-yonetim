ALTER TABLE `commissionTransactions` ADD `externalOfficeAgreementPartyName` varchar(180);--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `externalOfficeAgreementScopeNote` text;--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `externalOfficeAgreementMinFee` decimal(14,2);--> statement-breakpoint
ALTER TABLE `commissionTransactions` ADD `externalOfficeAgreementMaxFee` decimal(14,2);