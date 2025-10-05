-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "topic_id" SERIAL NOT NULL,
    "topic_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("topic_id")
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "interest_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "set_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("interest_id")
);

-- CreateTable
CREATE TABLE "UserSearchHistory" (
    "history_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "search_keyword" VARCHAR(100) NOT NULL,
    "search_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hit_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "UserSearchHistory_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "Topic_Economic_Article" (
    "article_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "summary_text" TEXT,
    "full_text" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "source" VARCHAR(100),
    "published_date" TIMESTAMP(3) NOT NULL,
    "crawled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "information_depth" VARCHAR(50) NOT NULL,
    "focus_area" VARCHAR(50),
    "objectivity_score" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "Topic_Economic_Article_pkey" PRIMARY KEY ("article_id")
);

-- CreateTable
CREATE TABLE "Topic_Social_Article" (
    "article_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "summary_text" TEXT,
    "full_text" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "source" VARCHAR(100),
    "published_date" TIMESTAMP(3) NOT NULL,
    "crawled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "information_depth" VARCHAR(50) NOT NULL,
    "focus_area" VARCHAR(50),
    "objectivity_score" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "Topic_Social_Article_pkey" PRIMARY KEY ("article_id")
);

-- CreateTable
CREATE TABLE "Topic_IT_Science_Article" (
    "article_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "summary_text" TEXT,
    "full_text" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "source" VARCHAR(100),
    "published_date" TIMESTAMP(3) NOT NULL,
    "crawled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "information_depth" VARCHAR(50) NOT NULL,
    "focus_area" VARCHAR(50),
    "objectivity_score" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "Topic_IT_Science_Article_pkey" PRIMARY KEY ("article_id")
);

-- CreateTable
CREATE TABLE "Topic_Sports_Article" (
    "article_id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "summary_text" TEXT,
    "full_text" TEXT NOT NULL,
    "image_url" VARCHAR(255),
    "source" VARCHAR(100),
    "published_date" TIMESTAMP(3) NOT NULL,
    "crawled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "information_depth" VARCHAR(50) NOT NULL,
    "focus_area" VARCHAR(50),
    "objectivity_score" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "Topic_Sports_Article_pkey" PRIMARY KEY ("article_id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "keyword_id" SERIAL NOT NULL,
    "keyword_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("keyword_id")
);

-- CreateTable
CREATE TABLE "ArticleKeyword" (
    "article_keyword_id" SERIAL NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "article_id" INTEGER NOT NULL,
    "keyword_id" INTEGER NOT NULL,

    CONSTRAINT "ArticleKeyword_pkey" PRIMARY KEY ("article_keyword_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_topic_name_key" ON "Topic"("topic_name");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_user_id_topic_id_key" ON "UserInterest"("user_id", "topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_keyword_name_key" ON "Keyword"("keyword_name");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleKeyword_topic_id_article_id_keyword_id_key" ON "ArticleKeyword"("topic_id", "article_id", "keyword_id");

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSearchHistory" ADD CONSTRAINT "UserSearchHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleKeyword" ADD CONSTRAINT "ArticleKeyword_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("topic_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleKeyword" ADD CONSTRAINT "ArticleKeyword_keyword_id_fkey" FOREIGN KEY ("keyword_id") REFERENCES "Keyword"("keyword_id") ON DELETE RESTRICT ON UPDATE CASCADE;
