-- CreatePromptConversationTable
-- 添加AI对话表

CREATE TABLE "prompt_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT NOT NULL DEFAULT 'web',
    "finalPrompt" TEXT,
    "appliedAt" DATETIME,
    "messages" TEXT NOT NULL DEFAULT '[]',
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "prompt_conversations_recordId_idx" ON "prompt_conversations"("recordId");
CREATE INDEX "prompt_conversations_status_idx" ON "prompt_conversations"("status");
