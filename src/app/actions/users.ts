'use server';

import { createUser as dbCreateUser, updateUserStatus } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

export async function createUser(companyName: string) {
  try {
    await dbCreateUser(companyName);
    revalidatePath('/users');
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create user',
    };
  }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  try {
    await updateUserStatus(userId, isActive);
    revalidatePath('/users');
    revalidatePath(`/users/${userId}`);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update user status',
    };
  }
}
