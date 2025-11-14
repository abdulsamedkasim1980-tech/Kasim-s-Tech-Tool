
import type { GeneratedImage } from '../types';

declare const JSZip: any;

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        const base64Content = result.split(',')[1];
        if (base64Content) {
            resolve(base64Content);
        } else {
            reject(new Error("Failed to extract base64 content from file."));
        }
    };
    reader.onerror = (error) => reject(error);
  });
};

const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}${month.charAt(0).toUpperCase() + month.slice(1)}${year}`;
}

export const downloadBase64Image = (base64: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = `data:image/png;base64,${base64}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const createZipAndDownload = async (images: GeneratedImage[]) => {
  if (typeof JSZip === 'undefined') {
    alert('JSZip library not loaded. Cannot download all images.');
    return;
  }
  const zip = new JSZip();
  
  images.forEach((image, index) => {
    const fileName = `${String(index + 1).padStart(3, '0')}_${formatDate(image.timestamp)}.png`;
    zip.file(fileName, image.imageBase64, { base64: true });
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = `AI_Story_${formatDate(new Date())}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
