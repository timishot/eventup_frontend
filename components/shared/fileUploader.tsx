'use client'

import { useCallback, Dispatch, SetStateAction, useState } from 'react'
import { useDropzone } from '@uploadthing/react'
import { generateClientDropzoneAccept } from 'uploadthing/client'

import { Button } from '@/components/ui/button'
import { convertFileToUrl } from '@/lib/utils'
import { useUploadThing } from '@/lib/uploadthing'

type FileUploaderProps = {
    onFieldChange: (url: string) => void
    imageUrl: string | undefined
    setFiles: Dispatch<SetStateAction<File[]>>
}

export function FileUploader({ imageUrl, onFieldChange, setFiles }: FileUploaderProps) {
    const [localFiles, setLocalFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)

    const { startUpload, routeConfig } = useUploadThing('imageUploader', {
        onClientUploadComplete: (res: any) => {
            if (res && res[0]?.url) {
                onFieldChange(res[0].url)
            }
        },
        onUploadError: () => {
            alert('Upload error')
        },
    })

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            setFiles(acceptedFiles)
            setLocalFiles(acceptedFiles)
            onFieldChange(convertFileToUrl(acceptedFiles[0]))
        },
        [setFiles, onFieldChange]
    )

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: generateClientDropzoneAccept(['image/png', 'image/jpeg', 'image/svg+xml']),
    })

    const handleUpload = async () => {
        if (localFiles.length === 0) {
            alert('Please select or drag a file first.')
            return
        }

        try {
            setIsUploading(true)
            await startUpload(localFiles)
        } catch (err) {
            console.error('❌ Upload failed:', err)
            alert('Upload failed.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div
            {...getRootProps()}
            className="flex justify-center items-center flex-col h-72 cursor-pointer overflow-hidden rounded-xl bg-[#F6F6F6]"
        >
            <input {...getInputProps()} className="cursor-pointer" />

            {imageUrl ? (
                <div className="flex h-full w-full flex-1 justify-center">
                    <img
                        src={imageUrl}
                        alt="Uploaded preview"
                        width={250}
                        height={250}
                        className="w-full object-cover object-center"
                    />
                </div>
            ) : (
                <div className="flex justify-center items-center flex-col py-5 text-[#757575]">
                    <img src="/assets/icon/upload.svg" width={77} height={77} alt="upload icon" />
                    <h3 className="mb-2 mt-2">Drag photo here</h3>
                    <p className="p-medium-12 mb-4">SVG, PNG, JPG</p>
                    <Button
                        type="button"
                        className="rounded-full bg-blue-500 text-white"
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Photo'}
                    </Button>
                </div>
            )}
        </div>
    )
}
