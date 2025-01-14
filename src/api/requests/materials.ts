interface IPostMaterialBody {
  title: string;
  content: string;
  language: string;
  organizationId: string;
  isPublic: boolean;
  tags: string[];
  type: 'text' | 'song' | 'game';
}

interface IMaterialResponse {
  id: string;
  title: string;
  content: string;
  language: string;
  organizationId: string;
  isPublic: boolean;
  tags: string[];
  type: 'text' | 'song' | 'game';
}

export const postMaterial = async (data: IPostMaterialBody): Promise<IMaterialResponse> => {
  const response = await fetch('/api/materials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create material');
  }

  const result = await response.json();
  return result.data;
};

export const updateMaterial = async (id: string, data: Partial<IPostMaterialBody>): Promise<Response> => {
  const response = await fetch(`/api/materials/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response;
};

export const deleteMaterial = async (id: string, type: 'text' | 'song' | 'game'): Promise<void> => {
  const response = await fetch(`/api/materials/${id}?type=${type}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete ${type}`);
  }
};
