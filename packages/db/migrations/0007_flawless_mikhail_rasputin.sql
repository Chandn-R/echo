ALTER TABLE "PostLikes" DROP CONSTRAINT "PostLikes_PostId_Users_UserId_fk";
--> statement-breakpoint
ALTER TABLE "PostLikes" ADD CONSTRAINT "PostLikes_PostId_Posts_PostId_fk" FOREIGN KEY ("PostId") REFERENCES "public"."Posts"("PostId") ON DELETE cascade ON UPDATE no action;