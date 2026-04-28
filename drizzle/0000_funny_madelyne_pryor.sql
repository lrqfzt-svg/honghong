CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_no" text,
	"user_id" integer NOT NULL,
	"amount" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"remark" text,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"password" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" integer NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
