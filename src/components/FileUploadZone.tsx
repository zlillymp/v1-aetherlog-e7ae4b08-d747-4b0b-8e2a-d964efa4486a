import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { parseCallFilename } from '@/lib/utils';
import { useAetherLogActions } from '@/lib/store';
export function FileUploadZone() {
  const { uploadCallRecord, selectContact } = useAetherLogActions();
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadPromises = acceptedFiles.map(file => {
      const parsedData = parseCallFilename(file.name);
      if (!parsedData) {
        toast.error(`Invalid filename format: ${file.name}`);
        return Promise.resolve(null);
      }
      return uploadCallRecord(parsedData);
    });
    const toastId = toast.loading(`Processing ${uploadPromises.length} file(s)...`);
    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(r => r !== null);
      if (successfulUploads.length > 0) {
        toast.success(`${successfulUploads.length} call record(s) successfully added.`, {
          id: toastId,
        });
        // Select the contact from the last successful upload
        const lastUpload = successfulUploads[successfulUploads.length - 1];
        if (lastUpload) {
          selectContact(lastUpload.contact.id);
        }
      } else {
        toast.warning('No files were processed.', { id: toastId });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error('An error occurred during upload.', { id: toastId });
    }
  }, [uploadCallRecord, selectContact]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.m4a', '.wav', '.ogg'] },
  });
  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ease-in-out',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        isDragActive
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50 hover:bg-accent'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground">
        <motion.div
          animate={{ y: isDragActive ? [-5, 5, -5] : 0 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'mirror' }}
        >
          <UploadCloud className={cn('h-16 w-16', isDragActive && 'text-primary')} />
        </motion.div>
        {isDragActive ? (
          <p className="text-lg font-semibold text-primary">Drop the files here ...</p>
        ) : (
          <>
            <p className="text-lg font-semibold text-foreground">Drag & drop call recordings here</p>
            <p className="text-sm">or click to select files</p>
            <p className="text-xs text-muted-foreground/80">Supported formats: MP3, M4A, WAV, OGG</p>
          </>
        )}
      </div>
    </div>
  );
}