import { useState, useCallback } from "react";
import { Upload, FileText, X, Link2, Key } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { toast } from "sonner";

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  onTranscriptionChange: (transcription: string | null) => void;
  disabled?: boolean;
}

export const FileUpload = ({ onFileChange, onTranscriptionChange, disabled }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tldvApiKey, setTldvApiKey] = useState(() => localStorage.getItem('tldv_api_key') || '');
  const [tldvCallLink, setTldvCallLink] = useState('');
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false);
  const [transcriptionObtained, setTranscriptionObtained] = useState(false);

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
    setTranscriptionObtained(false);
    onTranscriptionChange(null);
  };

  const handleApiKeyChange = (value: string) => {
    setTldvApiKey(value);
    localStorage.setItem('tldv_api_key', value);
  };

  const fetchTldvTranscription = async () => {
    if (!tldvApiKey.trim()) {
      toast.error("Por favor, insira a API Key do tl.dv");
      return;
    }

    if (!tldvCallLink.trim()) {
      toast.error("Por favor, insira o link da call");
      return;
    }

    setIsLoadingTranscription(true);

    try {
      // Extrair o ID da call do link (assumindo formato: https://tldv.io/app/meetings/[ID])
      const meetingIdMatch = tldvCallLink.match(/meetings\/([^/?]+)/);
      if (!meetingIdMatch) {
        throw new Error("Link inválido. Use o formato: https://tldv.io/app/meetings/[ID]");
      }

      const meetingId = meetingIdMatch[1];

      // Fazer requisição para a API do tl.dv
      const response = await fetch(`https://api.tldv.io/v1/meetings/${meetingId}/transcript`, {
        headers: {
          'x-api-key': tldvApiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar transcrição: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Formatar a transcrição
      const formattedTranscription = data.transcript
        ?.map((entry: any) => `[${entry.speaker}]: ${entry.text}`)
        .join('\n\n') || '';

      if (!formattedTranscription) {
        throw new Error("Transcrição vazia ou formato inválido");
      }

      onTranscriptionChange(formattedTranscription);
      setTranscriptionObtained(true);
      toast.success("Transcrição obtida com sucesso!");
    } catch (error: any) {
      console.error('Erro ao buscar transcrição:', error);
      toast.error(error.message || "Erro ao buscar transcrição do tl.dv");
      setTranscriptionObtained(false);
      onTranscriptionChange(null);
    } finally {
      setIsLoadingTranscription(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Upload className="w-4 h-4 text-primary" />
        Transcrição da Call
        <span className="text-destructive">*</span>
      </label>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file" disabled={disabled}>
            <FileText className="w-4 h-4 mr-2" />
            Arquivo .docx
          </TabsTrigger>
          <TabsTrigger value="tldv" disabled={disabled}>
            <Link2 className="w-4 h-4 mr-2" />
            Link tl.dv
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-2 mt-4">
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
        </TabsContent>

        <TabsContent value="tldv" className="space-y-4 mt-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-2 mb-3">
              <Key className="w-4 h-4 text-primary mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">Configure sua API Key do tl.dv</p>
                <p className="text-xs text-muted-foreground">
                  Acesse{" "}
                  <a 
                    href="https://tldv.io/app/settings/personal-settings/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    suas configurações no tl.dv
                  </a>
                  {" "}para gerar uma API Key
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="tldv-api-key">API Key *</Label>
                <Input
                  id="tldv-api-key"
                  type="password"
                  value={tldvApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Cole sua API Key aqui"
                  disabled={disabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tldv-call-link">Link da Call *</Label>
                <Input
                  id="tldv-call-link"
                  type="url"
                  value={tldvCallLink}
                  onChange={(e) => setTldvCallLink(e.target.value)}
                  placeholder="https://tldv.io/app/meetings/..."
                  disabled={disabled}
                />
              </div>

              <Button
                onClick={fetchTldvTranscription}
                disabled={disabled || isLoadingTranscription || !tldvApiKey || !tldvCallLink}
                className="w-full"
                variant={transcriptionObtained ? "secondary" : "default"}
              >
                {isLoadingTranscription ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Obtendo transcrição...
                  </>
                ) : transcriptionObtained ? (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    ✓ Transcrição obtida
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Obter Transcrição
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
