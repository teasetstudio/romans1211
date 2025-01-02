export const getHeaderToken = (token: string) => ({
  Authorization: `Bearer ${token}`,
})
