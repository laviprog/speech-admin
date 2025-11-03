'use server';

import { createApiKey, deleteApiKey, toggleApiKeyStatus } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';
import { createHash, randomBytes } from 'crypto';

export async function createApiKeyAction(userId: string, name?: string) {
  try {
    const apiKey = `syn-stt-${randomBytes(32).toString('hex')}`;

    const keyPrefix = apiKey.substring(0, 10);

    const keyHash = createHash('sha256').update(apiKey).digest('hex');

    await createApiKey(userId, keyPrefix, keyHash, name);

    return { apiKey };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create API key',
    };
  }
}

export async function toggleApiKeyStatusAction(apiKeyId: string, isActive: boolean) {
  try {
    await toggleApiKeyStatus(apiKeyId, isActive);
    revalidatePath('/api-keys');
    revalidatePath('/users');
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update API key status',
    };
  }
}

export async function deleteApiKeyAction(apiKeyId: string) {
  try {
    await deleteApiKey(apiKeyId);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete API key',
    };
  }
}
