type FileIconResult = {
  icon: string
  color: string
}

const extensionMap: Record<string, FileIconResult> = {
  // PDF
  pdf: { icon: 'picture_as_pdf', color: 'red-7' },

  // Word
  doc:  { icon: 'description', color: 'blue-7' },
  docx: { icon: 'description', color: 'blue-7' },

  // Excel
  xls:  { icon: 'table_chart', color: 'green-7' },
  xlsx: { icon: 'table_chart', color: 'green-7' },
  csv:  { icon: 'table_chart', color: 'green-6' },

  // PowerPoint
  ppt:  { icon: 'slideshow', color: 'orange-7' },
  pptx: { icon: 'slideshow', color: 'orange-7' },

  // Imagens
  png:  { icon: 'image', color: 'teal-6' },
  jpg:  { icon: 'image', color: 'teal-6' },
  jpeg: { icon: 'image', color: 'teal-6' },
  gif:  { icon: 'image', color: 'teal-6' },
  webp: { icon: 'image', color: 'teal-6' },
  svg:  { icon: 'image', color: 'teal-6' },

  // Vídeo
  mp4: { icon: 'movie', color: 'purple-6' },

  // Compactados
  zip: { icon: 'folder_zip', color: 'amber-7' },
  rar: { icon: 'folder_zip', color: 'amber-7' },
  '7z': { icon: 'folder_zip', color: 'amber-7' },

  // Texto
  txt: { icon: 'article', color: 'grey-6' },
}

const fallback: FileIconResult = { icon: 'insert_drive_file', color: 'grey-5' }

export function getFileIcon(filename: string): FileIconResult {
  if (!filename) return fallback
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return extensionMap[ext] ?? fallback
}
