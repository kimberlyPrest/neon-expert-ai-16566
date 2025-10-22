import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export const FileUpload = ({ onFileChange, disabled }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith('.docx')) {
      toast.error("Envie um arquivo .docx válido");
      return false;
    }
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Tamanho máximo: 50 MB");
      return false;
    }
    
    return true;
  };

  const handleFile = useCallback((selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      onFileChange(selectedFile);
      toast.success("Arquivo validado pelo Expert System - qualidade aprovada!");
    }
  }, [onFileChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [disabled, handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    onFileChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Upload className="w-4 h-4 text-primary" />
        Transcrição da Call
        <span className="text-destructive">*</span>
      </label>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative rounded-lg border-2 border-dashed p-8 text-center transition-all
          ${isDragging ? 'border-primary bg-primary/5 neon-glow' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}
          ${file ? 'bg-card/50' : ''}
        `}
      >
        {file ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 neon-border">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!disabled && (
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <>
            <input
              type="file"
              accept=".docx"
              onChange={handleFileInput}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-foreground mb-1">
              Arraste o arquivo .docx ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              Formato aceito: .docx • Tamanho máximo: 50 MB
            </p>
          </>
        )}
      </div>
    </div>
  );
};
