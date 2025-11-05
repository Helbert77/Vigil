export const getFileTypeFromUrl = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
    return 'image';
  }
  if (['mp4', 'webm', 'ogg'].includes(extension)) {
    return 'video';
  }
  return extension;
};