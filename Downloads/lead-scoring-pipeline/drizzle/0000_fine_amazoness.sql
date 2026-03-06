CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`entityType` enum('lead','subscriber','campaign','pipeline') NOT NULL,
	`entityId` int,
	`value` float DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(255) NOT NULL,
	`title` varchar(255),
	`intentScore` float NOT NULL DEFAULT 0,
	`intentLevel` enum('hot','warm','cool','cold') NOT NULL DEFAULT 'cold',
	`status` enum('new','contacted','qualified','proposal','won','lost') NOT NULL DEFAULT 'new',
	`source` enum('organic','paid','referral','social','email') NOT NULL DEFAULT 'organic',
	`signals` json,
	`tags` json,
	`aiScoreSummary` text,
	`sourceUrl` varchar(1000),
	`profileUrl` varchar(1000),
	`websiteUrl` varchar(1000),
	`lastActivity` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationType` enum('lead_scored','lead_progressed','new_subscriber','outreach_sent','system') NOT NULL DEFAULT 'system',
	`title` varchar(500) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `outreach_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int,
	`leadName` varchar(255) NOT NULL,
	`leadEmail` varchar(320) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`tone` enum('professional','friendly','urgent','casual') NOT NULL DEFAULT 'professional',
	`outreachStatus` enum('draft','sent','opened','replied','bounced') NOT NULL DEFAULT 'draft',
	`generatedByAi` boolean NOT NULL DEFAULT false,
	`sentAt` timestamp,
	`openedAt` timestamp,
	`repliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outreach_campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`source` enum('organic','paid','referral','social','email') NOT NULL DEFAULT 'organic',
	`subscriberStatus` enum('active','unsubscribed','bounced') NOT NULL DEFAULT 'active',
	`leadScore` float NOT NULL DEFAULT 0,
	`engagementRate` float NOT NULL DEFAULT 0,
	`subscribedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscribers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
