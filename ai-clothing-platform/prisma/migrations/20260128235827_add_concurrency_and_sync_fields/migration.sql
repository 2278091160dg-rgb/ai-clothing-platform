-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feishuUserId" TEXT,
    "feishuOpenId" TEXT,
    "feishuUnionId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "feishuRecordId" TEXT,
    "feishuAppToken" TEXT,
    "feishuTableId" TEXT,
    "productImageUrl" TEXT,
    "productImageToken" TEXT,
    "sceneImageUrl" TEXT,
    "sceneImageToken" TEXT,
    "prompt" TEXT,
    "originalPrompt" TEXT,
    "optimizedPrompt" TEXT,
    "promptSource" TEXT NOT NULL DEFAULT 'USER',
    "promptOptimizationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "promptOptimizationId" TEXT,
    "promptOptimizedAt" DATETIME,
    "aiModel" TEXT NOT NULL DEFAULT 'FLUX.1',
    "aspectRatio" TEXT NOT NULL DEFAULT '1:1',
    "imageCount" INTEGER NOT NULL DEFAULT 4,
    "quality" TEXT NOT NULL DEFAULT 'high',
    "resultImageUrls" TEXT,
    "resultImageTokens" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "lastModifiedBy" TEXT,
    "lastModifiedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conflictDetected" BOOLEAN NOT NULL DEFAULT false,
    "syncStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "syncError" TEXT,
    "lastSyncAt" DATETIME,
    "batchId" TEXT,
    "batchIndex" INTEGER,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "source" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "requestData" JSONB,
    "responseData" JSONB,
    "status" TEXT NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "sync_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_quotas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalQuota" INTEGER NOT NULL DEFAULT 1000,
    "usedQuota" INTEGER NOT NULL DEFAULT 0,
    "remainingQuota" INTEGER NOT NULL DEFAULT 1000,
    "resetPeriod" TEXT NOT NULL DEFAULT 'MONTHLY',
    "resetAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "template" TEXT NOT NULL,
    "variables" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "login_page_config" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoUrl" TEXT,
    "logoEmoji" TEXT NOT NULL DEFAULT '🏭️',
    "title" TEXT NOT NULL DEFAULT '杭州龙易AI系统',
    "subtitle1" TEXT NOT NULL DEFAULT '电商AI践行中',
    "subtitle2" TEXT NOT NULL DEFAULT 'AI智能 · 海报生成 · 场景创作',
    "passwordLabel" TEXT NOT NULL DEFAULT 'VIP密码',
    "passwordPlaceholder" TEXT NOT NULL DEFAULT '请输入VIP密码',
    "buttonText" TEXT NOT NULL DEFAULT '芝麻开门',
    "buttonLoadingText" TEXT NOT NULL DEFAULT '验证中...',
    "footerText" TEXT NOT NULL DEFAULT '🔒 系统已启用访问密码保护',
    "copyrightText" TEXT NOT NULL DEFAULT '© 2026 杭州龙易科技 · v1.0.0',
    "backgroundImageUrl" TEXT,
    "backgroundStyle" TEXT NOT NULL DEFAULT 'tech-ai',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_feishuUserId_key" ON "users"("feishuUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_feishuOpenId_key" ON "users"("feishuOpenId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_feishuUserId_idx" ON "users"("feishuUserId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_feishuRecordId_key" ON "tasks"("feishuRecordId");

-- CreateIndex
CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");

-- CreateIndex
CREATE INDEX "tasks_feishuRecordId_idx" ON "tasks"("feishuRecordId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_batchId_idx" ON "tasks"("batchId");

-- CreateIndex
CREATE INDEX "tasks_expiresAt_idx" ON "tasks"("expiresAt");

-- CreateIndex
CREATE INDEX "tasks_version_idx" ON "tasks"("version");

-- CreateIndex
CREATE INDEX "tasks_lastModifiedAt_idx" ON "tasks"("lastModifiedAt");

-- CreateIndex
CREATE INDEX "tasks_syncStatus_idx" ON "tasks"("syncStatus");

-- CreateIndex
CREATE INDEX "sync_logs_userId_idx" ON "sync_logs"("userId");

-- CreateIndex
CREATE INDEX "sync_logs_entityId_idx" ON "sync_logs"("entityId");

-- CreateIndex
CREATE INDEX "sync_logs_status_idx" ON "sync_logs"("status");

-- CreateIndex
CREATE INDEX "sync_logs_createdAt_idx" ON "sync_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_quotas_userId_key" ON "user_quotas"("userId");

-- CreateIndex
CREATE INDEX "prompt_templates_userId_idx" ON "prompt_templates"("userId");

-- CreateIndex
CREATE INDEX "prompt_templates_category_idx" ON "prompt_templates"("category");
