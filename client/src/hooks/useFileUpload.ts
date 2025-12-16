import { useState, useCallback, useRef } from 'react';
import { isImageFile } from '../lib/utils';

interface FileUpload {
    file: File;
    preview: string;
    type: 'image' | 'file';
}

interface UseFileUploadReturn {
    files: FileUpload[];
    isUploading: boolean;
    selectFiles: () => void;
    removeFile: (index: number) => void;
    clearFiles: () => void;
    getFileData: (file: File) => Promise<{ url: string; name: string; size: number }>;
}

export function useFileUpload(): UseFileUploadReturn {
    const [files, setFiles] = useState<FileUpload[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const selectFiles = useCallback(() => {
        if (!inputRef.current) {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*,application/pdf,.doc,.docx,.txt,.zip,.rar';

            input.onchange = async (e) => {
                const target = e.target as HTMLInputElement;
                const selectedFiles = Array.from(target.files || []);

                setIsUploading(true);

                const uploads: FileUpload[] = await Promise.all(
                    selectedFiles.map(async (file) => {
                        const isImage = isImageFile(file.name);
                        let preview = '';

                        if (isImage) {
                            preview = await new Promise<string>((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result as string);
                                reader.readAsDataURL(file);
                            });
                        }

                        return {
                            file,
                            preview,
                            type: isImage ? 'image' : 'file'
                        };
                    })
                );

                setFiles(prev => [...prev, ...uploads]);
                setIsUploading(false);

                // Reset input
                target.value = '';
            };

            inputRef.current = input;
        }

        inputRef.current.click();
    }, []);

    const removeFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearFiles = useCallback(() => {
        setFiles([]);
    }, []);

    const getFileData = useCallback(async (file: File): Promise<{ url: string; name: string; size: number }> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({
                    url: reader.result as string,
                    name: file.name,
                    size: file.size
                });
            };
            reader.readAsDataURL(file);
        });
    }, []);

    return {
        files,
        isUploading,
        selectFiles,
        removeFile,
        clearFiles,
        getFileData
    };
}
