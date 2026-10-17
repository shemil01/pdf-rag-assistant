'use server';

import { BACKEND_URL } from '@/lib/config';

export async function chatAction(messages: any[], documentId: string | null) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, documentId }),
    });

    if (!response.ok) {
      throw new Error('Failed to communicate with chat backend');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error in chatAction:', error);
    throw new Error('An unexpected error occurred during chat');
  }
}
