'use server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:3001';

export async function uploadDocumentAction(formData: FormData) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload document to backend');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error in uploadDocumentAction:', error);
    throw new Error(error.message || 'An unexpected error occurred during upload');
  }
}

export async function getDocumentsAction() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents from backend');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error in getDocumentsAction:', error);
    return [];
  }
}

export async function deleteDocumentAction(id: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/documents/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteDocumentAction:', error);
    throw new Error('Failed to delete document');
  }
}
