import { pgTable, text, uuid, jsonb, timestamp, date, boolean, integer, primaryKey, index } from "drizzle-orm/pg-core";
import type {
    InferSelectModel,
    InferInsertModel,
} from "drizzle-orm";

export const users = pgTable("Users", {

    userId: uuid("UserId").defaultRandom().primaryKey(),
    name: text("Name").notNull(),
    userName: text("UserName").notNull().unique(),
    email: text("Email").notNull().unique(),
    password: text("Password").notNull(),
    profilePicture: jsonb("ProfilePicture").default({ secure_url: "", public_id: "" }),
    createdAt: timestamp("CreatedAt").defaultNow(),
    updatedAt: timestamp("UpdatedAt").defaultNow()

});

export const profileSettings = pgTable("ProfileSettings", {

    profileId: uuid("ProfileId").defaultRandom().primaryKey(),
    userId: uuid("UserId").notNull().references(() => users.userId, { onDelete: "cascade" }),
    bio: text("Bio").default(""),
    birthDate: date("BirthDate"),
    private: boolean("Private").default(true),
    country: text("Country").default("India"),
    language: text("Language").default("english"),

});

export const posts = pgTable("Posts", {

    postId: uuid("PostId").defaultRandom().primaryKey(),
    userId: uuid("UserId").notNull().references(() => users.userId, { onDelete: "cascade" }),
    image: jsonb("Image").default({ secure_url: "", public_id: "" }).notNull(),
    description: text("Description").default(""),
    likes: integer("Likes").default(0),
    comments: integer("Comments").default(0),
    createdAt: timestamp("CreatedAt").defaultNow(),
    updatedAt: timestamp("UpdatedAt").defaultNow()

});

export const postLikes = pgTable("PostLikes", {

    userId: uuid("UserId").notNull().references(() => users.userId, { onDelete: "cascade" }),
    postId: uuid("PostId").notNull().references(() => posts.postId, { onDelete: "cascade" }),

}, (table) => [

    primaryKey({ columns: [table.userId, table.postId] }),

]);

export const postComments = pgTable("PostComments", {

    commentId: uuid("CommentId").defaultRandom().primaryKey(),
    postId: uuid("PostId").notNull().references(() => posts.postId, { onDelete: "cascade" }),
    userId: uuid("UserId").notNull().references(() => users.userId, { onDelete: "cascade" }),
    comment: text("Comment").notNull(),
    createdAt: timestamp("CreatedAt").defaultNow(),
    updatedAt: timestamp("UpdatedAt").defaultNow(),

});

export const follows = pgTable("Follows", {

    followerId: uuid("FollowerId").notNull().references(() => users.userId, { onDelete: 'cascade' }),
    followingId: uuid("FollowingId").notNull().references(() => users.userId, { onDelete: 'cascade' }),

}, (table) => [

    primaryKey({ columns: [table.followerId, table.followingId] }),
    index("follower_idx").on(table.followerId),
    index("following_idx").on(table.followingId),

]);

export const blogs = pgTable("Blogs", {

    blogId: uuid("BlogId").defaultRandom().primaryKey(),
    userId: uuid("UserId").notNull().references(() => users.userId, { onDelete: "cascade" }),
    content: jsonb("Content").notNull(),
    likes: integer("Likes").default(0),
    comments: integer("Comments").default(0),
    createdAt: timestamp("CreatedAt").defaultNow(),
    updatedAt: timestamp("UpdatedAt").defaultNow(),

});

export const blogLikes = pgTable("BlogLikes", {

    userId: uuid("UserId").notNull().references(() => users.userId, { onDelete: "cascade" }),
    blogId: uuid("BlogId").notNull().references(() => users.userId, { onDelete: "cascade" }),

}, (table) => [

    primaryKey({ columns: [table.userId, table.blogId] })

]);

export const blogComments = pgTable("BlogComments", {

    commentId: uuid("CommentId").defaultRandom().primaryKey(),
    blogId: uuid("BlogId").notNull().references(() => blogs.blogId, { onDelete: "cascade" }),
    userId: uuid("UserId").notNull().references(() => users.userId, { onDelete: "cascade" }),
    comment: text("Comment").notNull(),
    createdAt: timestamp("CreatedAt").defaultNow(),
    updatedAt: timestamp("UpdatedAt").defaultNow(),

});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type ProfileSetting = InferSelectModel<typeof profileSettings>;
export type NewProfileSetting = InferInsertModel<typeof profileSettings>;
export type Follow = InferSelectModel<typeof follows>;
export type NewFollow = InferInsertModel<typeof follows>;
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;
export type PostLike = InferSelectModel<typeof postLikes>;
export type NewPostLike = InferInsertModel<typeof postLikes>;
export type PostComment = InferSelectModel<typeof postComments>;
export type NewPostComment = InferInsertModel<typeof postComments>;
export type Blog = InferSelectModel<typeof blogs>;
export type NewBlog = InferInsertModel<typeof blogs>;
export type BlogLike = InferSelectModel<typeof blogLikes>;
export type NewBlogLike = InferInsertModel<typeof blogLikes>;
export type BlogComment = InferSelectModel<typeof blogComments>;
export type NewBlogComment = InferInsertModel<typeof blogComments>;