// @flow

export const formatFileUpload = (id: string, type: string, filename: string): string => {
  return `user_id=${id} type=${type} filename=${filename}`;
}