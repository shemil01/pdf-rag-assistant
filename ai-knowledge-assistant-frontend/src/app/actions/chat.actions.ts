'use server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:3001';

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
