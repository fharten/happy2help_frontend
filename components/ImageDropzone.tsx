'use client';

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/shadcn-io/dropzone';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ButtonComponent from './ButtonComponent';
import { toast } from 'sonner';

interface ImageDropzoneProps {
  resourceType: 'projects' | 'ngos' | 'users';
  resourceId: string;
  onUploadSuccess?: (data: unknown) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

const ImageDropzone = ({
  resourceType,
  resourceId,
  onUploadSuccess,
  onUploadError,
  className = '',
}: ImageDropzoneProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { tokens } = useAuth();

  const isProject = resourceType === 'projects';
  const maxFiles = isProject ? 5 : 1;
  const endpoint = isProject ? 'images' : 'image';

  const handleDrop = (newFiles: File[]) => {
    const updatedFiles = isProject ? [...files, ...newFiles] : newFiles;
    const limitedFiles = updatedFiles.slice(0, maxFiles);

    setFiles(limitedFiles);

    // Generate previews for all files
    const previews: string[] = [];
    limitedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          previews[index] = e.target.result;
          if (previews.filter(Boolean).length === limitedFiles.length) {
            setFilePreviews([...previews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setFilePreviews(updatedPreviews);
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      onUploadError?.('No files selected');
      return;
    }

    if (!tokens?.accessToken) {
      onUploadError?.('Authentication required');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      if (isProject) {
        // MULTIPLE FILES FOR PROJECTS
        files.forEach((file) => {
          formData.append('images', file);
        });
      } else {
        // SINGLE IMAGE FOR NGO/USER
        formData.append('image', files[0]);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/${resourceType}/${resourceId}/${endpoint}`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Upload failed' }));
        throw new Error(
          errorData.message || `HTTP ${response.status}: Upload failed`
        );
      }

      const data = await response.json();

      // CLEAR FILES AFTER SUCCESSFUL UPLOAD
      setFiles([]);
      setFilePreviews([]);

      onUploadSuccess?.(data);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // SHOW LOADING STATE IF NO AUTH TOKENS YET
  if (!tokens) {
    return (
      <div className={`max-w-md mx-auto p-4 text-center ${className}`}>
        <div className='text-gray-500'>Loading...</div>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto space-y-4 ${className}`}>
      {/* FILE PREVIEWS*/}
      {filePreviews.length > 0 && (
        <div className='space-y-2'>
          {isProject ? (
            // MULTIPLE IMAGE PREVIEWS FOR PROJECTS
            <div className='grid grid-cols-2 gap-2'>
              {filePreviews.map((preview, index) => (
                <div key={index} className='relative h-[102px] w-full'>
                  <Image
                    width={200}
                    height={102}
                    alt={`Preview image ${index + 1}`}
                    className='absolute top-0 left-0 h-full w-full object-cover rounded'
                    src={preview}
                  />
                  <button
                    type='button'
                    className='absolute top-1 right-1 h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10'
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className='h-3 w-3' />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // SINGLE IMAGE PREVIEW FOR NGOS & USERS
            <div className='relative h-[102px] w-full'>
              <Image
                width={500}
                height={102}
                alt='Preview image'
                className='absolute top-0 left-0 h-full w-full object-cover rounded'
                src={filePreviews[0]}
              />
              <button
                type='button'
                className='absolute top-1 right-1 h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10'
                onClick={() => removeFile(0)}
                disabled={isUploading}
              >
                <X className='h-3 w-3' />
              </button>
            </div>
          )}
          <div className='text-center text-sm text-gray-600'>
            {files.length} of {maxFiles} file{maxFiles > 1 ? 's' : ''} selected
          </div>
        </div>
      )}

      <Dropzone
        accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
        maxFiles={maxFiles}
        maxSize={1024 * 1024 * 5} // 5MB
        minSize={1024} // 1KB
        onDrop={handleDrop}
        onError={(error) => {
          console.error('Dropzone error:', error);
          onUploadError?.(error.message || 'File drop error');
        }}
        src={files}
        className='hover:cursor-pointer'
        disabled={isUploading}
      >
        <DropzoneEmptyState />
        <DropzoneContent>
          {filePreviews.length === 0 && (
            <div className='text-center text-sm text-gray-500'>
              {isProject ? 'Bilder' : 'Bild'} hier her ziehen<br/> oder klicken, um eines auszuwählen.<br/>
              <span className='text-xs text-gray-400'>
                Max. {maxFiles} Datei{maxFiles > 1 ? 'en' : ''}, 5MB pro Bild
              </span>
            </div>
          )}
          {filePreviews.length > 0 && (
            <div className='text-center text-sm text-gray-500'>
              Mehr {isProject && files.length < maxFiles ? 'Bilder' : ''}{' '}
              hier her ziehen oder hier klicken, um {' '}
              {isProject && files.length < maxFiles ? 'mehr hinzuzufügen' : 'Bild zu ersetzen'}
            </div>
          )}
        </DropzoneContent>
      </Dropzone>

      {/* UPLOAD BUTTON */}
      {files.length > 0 && (
        <div className='flex justify-center'>
          <ButtonComponent
            disabled={isUploading || !tokens?.accessToken}
            variant='primary'
            onClick={uploadFiles}
            size='lg'
            className='w-full lg:w-auto'
          >
            {isUploading ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Lade hoch...
              </>
            ) : (
              <>
                <Upload className='mr-2 h-4 w-4' />
                {isProject ? 'Bilder' : 'Bild'} hochladen
              </>
            )}
          </ButtonComponent>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
