/**
 * Utilitário para gerar thumbnails/imagens de capa para documentos
 */

/**
 * Detecta o tipo de arquivo baseado na URL ou extensão
 */
export function getFileTypeFromUrl(url: string): 'image' | 'video' | 'document' | 'unknown' {
  if (!url) return 'unknown';
  
  const urlLower = url.toLowerCase();
  const extension = urlLower.split('.').pop()?.split('?')[0] || '';
  
  // Imagens
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  if (imageExtensions.includes(extension)) {
    return 'image';
  }
  
  // Vídeos
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
  if (videoExtensions.includes(extension)) {
    return 'video';
  }
  
  // Documentos
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'md'];
  if (documentExtensions.includes(extension)) {
    return 'document';
  }
  
  return 'unknown';
}

/**
 * Gera uma imagem de capa para documentos usando Canvas
 */
export function generateDocumentThumbnail(
  title: string,
  fileType: string,
  options?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    textColor?: string;
    darkMode?: boolean;
  }
): string {
  const width = options?.width || 400;
  const height = options?.height || 600;
  const isDark = options?.darkMode ?? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const bgColor = options?.backgroundColor || (isDark ? '#1f2937' : '#f3f4f6');
  const textColor = options?.textColor || (isDark ? '#e5e7eb' : '#374151');
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return '';
  }
  
  // Fundo gradiente
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, bgColor);
  gradient.addColorStop(1, isDark ? '#374151' : '#e5e7eb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Borda decorativa
  ctx.strokeStyle = isDark ? '#4b5563' : '#d1d5db';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);
  
  // Ícone do tipo de arquivo (simulado com texto)
  ctx.fillStyle = textColor;
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const fileIcon = getFileTypeIcon(fileType);
  ctx.fillText(fileIcon, width / 2, height / 2 - 60);
  
  // Título do documento
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = textColor;
  const maxTitleWidth = width - 80;
  const titleLines = wrapText(ctx, title, maxTitleWidth);
  const lineHeight = 30;
  const startY = height / 2 + 40;
  
  titleLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + (index * lineHeight));
  });
  
  // Linhas decorativas simulando texto do documento
  ctx.strokeStyle = isDark ? '#6b7280' : '#9ca3af';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const y = startY + (titleLines.length * lineHeight) + 40 + (i * 20);
    const lineLength = width - 100 - (i % 3) * 20;
    ctx.beginPath();
    ctx.moveTo((width - lineLength) / 2, y);
    ctx.lineTo((width + lineLength) / 2, y);
    ctx.stroke();
  }
  
  return canvas.toDataURL('image/png');
}

/**
 * Retorna um ícone emoji/texto baseado no tipo de arquivo
 */
function getFileTypeIcon(fileType: string): string {
  const type = fileType.toLowerCase();
  
  if (type.includes('pdf')) return '📄';
  if (type.includes('doc')) return '📝';
  if (type.includes('txt')) return '📃';
  if (type.includes('xls')) return '📊';
  if (type.includes('ppt')) return '📽️';
  if (type.includes('csv')) return '📈';
  if (type.includes('md')) return '📋';
  
  return '📄';
}

/**
 * Quebra texto em múltiplas linhas para caber na largura especificada
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + (currentLine ? ' ' : '') + words[i];
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Limita a 3 linhas
  return lines.slice(0, 3).map(line => {
    if (ctx.measureText(line).width > maxWidth) {
      return line.substring(0, Math.floor(line.length * 0.9)) + '...';
    }
    return line;
  });
}

/**
 * Cria uma URL de dados para thumbnail de documento
 * Se já existe uma imagem válida, retorna ela. Caso contrário, gera uma nova.
 */
export function getDocumentCoverUrl(
  coverUrl: string | undefined,
  fileUrl: string | undefined,
  title: string
): string | undefined {
  // Se já existe uma cover_url válida e é uma imagem, usa ela
  if (coverUrl) {
    const coverType = getFileTypeFromUrl(coverUrl);
    if (coverType === 'image') {
      return coverUrl;
    }
  }
  
  // Se não tem cover_url ou não é uma imagem, tenta gerar do file_url
  if (fileUrl) {
    const fileType = getFileTypeFromUrl(fileUrl);
    if (fileType === 'document') {
      // Extrai a extensão do arquivo
      const extension = fileUrl.toLowerCase().split('.').pop()?.split('?')[0] || '';
      return generateDocumentThumbnail(title, extension);
    }
  }
  
  // Se não tem file_url, gera um thumbnail genérico
  if (!coverUrl && !fileUrl) {
    return generateDocumentThumbnail(title, 'document');
  }
  
  return undefined;
}

