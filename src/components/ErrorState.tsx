import { AlertCircle, FileText, Wrench, Clock, FileWarning } from "lucide-react";
import { Button } from "./ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const getErrorTip = (message: string) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('formato') || lowerMessage.includes('reconhecido')) {
    return {
      icon: FileText,
      text: "📄 Reenvie um arquivo DOCX válido com transcrição"
    };
  }
  
  if (lowerMessage.includes('placeholder') || lowerMessage.includes('template')) {
    return {
      icon: Wrench,
      text: "🔧 Template precisa ser atualizado no Google Drive"
    };
  }
  
  if (lowerMessage.includes('análise') || lowerMessage.includes('incompleta')) {
    return {
      icon: FileWarning,
      text: "📝 Transcrição pode estar truncada ou ilegível"
    };
  }
  
  if (lowerMessage.includes('timeout') || lowerMessage.includes('tempo')) {
    return {
      icon: Clock,
      text: "⏱️ Call muito extensa - tente quebrar em sessões menores"
    };
  }
  
  return null;
};

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  const errorTip = getErrorTip(message);
  
  return (
    <div className="space-y-4">
      <div className="p-6 rounded-lg bg-destructive/10 border-2 border-destructive/30 neon-border space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-destructive/20">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Falha na geração do Expert System
            </h3>
            <p className="text-sm text-foreground/90">{message}</p>
          </div>
        </div>

        {errorTip && (
          <div className="p-4 rounded-lg bg-card/50 border border-border">
            <div className="flex items-center gap-3">
              <errorTip.icon className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">{errorTip.text}</p>
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onRetry}
        variant="outline"
        className="w-full neon-border hover:bg-primary/5"
      >
        Tentar Novamente
      </Button>
    </div>
  );
};
