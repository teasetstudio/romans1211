interface ITag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const getTags = async (): Promise<ITag[]> => {
  const response = await fetch('/api/tags', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }

  return response.json();
};

export const createTag = async (name: string): Promise<ITag> => {
  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('Failed to create tag');
  }

  return response.json();
};

export const updateTag = async (id: string, name: string): Promise<ITag> => {
  const response = await fetch(`/api/tags/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('Failed to update tag');
  }

  return response.json();
};

export const deleteTag = async (id: string): Promise<void> => {
  const response = await fetch(`/api/tags/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete tag');
  }
};
