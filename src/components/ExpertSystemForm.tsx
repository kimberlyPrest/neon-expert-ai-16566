import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { FileUpload } from "./FileUpload";
import { Sparkles, Trash2, Lightbulb, BookOpen, HelpCircle } from "lucide-react";
import { toast } from "sonner";

const CONSULTORES = [
  "Kimberly Prestes",
  "Lucas Machado",
  "Lucas Dias",
  "Vinicius Galetti",
  "Victor Borrajo",
  "Lucas Silva",
];

const OBSERVACOES_TEMPLATE = `Insights específicos da call:
- 

Decisões tomadas:
- 

Contexto adicional:
- 

Desafios identificados:
- `;

interface FormData {
  file: File | null;
  transcription: string | null;
  observacoes: string;
  cliente: string;
  dataRef: string;
  consultor: string;
}

interface ExpertSystemFormProps {
  onSubmit: (data: FormData) => void;
  disabled?: boolean;
}

export const ExpertSystemForm = ({ onSubmit, disabled }: ExpertSystemFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    file: null,
    transcription: null,
    observacoes: "",
    cliente: "",
    dataRef: new Date().toISOString().split('T')[0],
    consultor: "",
  });

  const [charCount, setCharCount] = useState(0);
  const maxChars = 2000;

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedCliente = localStorage.getItem('expert_system_cliente');
    const savedConsultor = localStorage.getItem('expert_system_consultor');
    
    if (savedCliente) setFormData(prev => ({ ...prev, cliente: savedCliente }));
    if (savedConsultor) setFormData(prev => ({ ...prev, consultor: savedConsultor }));
  }, []);

  const handleObservacoesChange = (value: string) => {
    if (value.length <= maxChars) {
      setFormData(prev => ({ ...prev, observacoes: value }));
      setCharCount(value.length);
    }
  };

  const handleSubmit = () => {
    if (!formData.file && !formData.transcription) {
      toast.error("Por favor, envie um arquivo de transcrição ou obtenha via tl.dv");
      return;
    }

    if (!formData.cliente.trim()) {
      toast.error("Por favor, informe o nome do cliente");
      return;
    }

    if (!formData.consultor) {
      toast.error("Por favor, selecione o consultor responsável");
      return;
    }

    // Salvar dados no localStorage
    localStorage.setItem('expert_system_cliente', formData.cliente);
    localStorage.setItem('expert_system_consultor', formData.consultor);

    onSubmit(formData);
  };

  const handleClear = () => {
    setFormData({
      file: null,
      transcription: null,
      observacoes: "",
      cliente: "",
      dataRef: new Date().toISOString().split('T')[0],
      consultor: "",
    });
    setCharCount(0);
    toast.info("Formulário limpo");
  };

  const handleTemplateClick = () => {
    setFormData(prev => ({ ...prev, observacoes: OBSERVACOES_TEMPLATE }));
    setCharCount(OBSERVACOES_TEMPLATE.length);
    toast.success("Template aplicado!");
  };

  return (
    <div className="space-y-6">
      <FileUpload
        onFileChange={(file) => setFormData(prev => ({ ...prev, file }))}
        onTranscriptionChange={(transcription) => setFormData(prev => ({ ...prev, transcription }))}
        disabled={disabled}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Observações do Consultor (opcional)</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTemplateClick}
            disabled={disabled}
            className="text-xs hover:text-primary"
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            📋 Template de Observações
          </Button>
        </div>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => handleObservacoesChange(e.target.value)}
          placeholder="Insights específicos, decisões tomadas, contexto adicional, desafios identificados..."
          disabled={disabled}
          className="min-h-[160px] resize-none"
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Permite múltiplos parágrafos</span>
          <span className={charCount > maxChars * 0.9 ? "text-destructive" : "text-muted-foreground"}>
            {charCount} / {maxChars}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>
            Cliente <span className="text-destructive">*</span>
          </Label>
          <Input
            value={formData.cliente}
            onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
            placeholder="Nome da empresa/projeto"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Data de Referência</Label>
          <Input
            type="date"
            value={formData.dataRef}
            onChange={(e) => setFormData(prev => ({ ...prev, dataRef: e.target.value }))}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>
            Consultor Responsável <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.consultor}
            onValueChange={(value) => setFormData(prev => ({ ...prev, consultor: value }))}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {CONSULTORES.map((consultor) => (
                <SelectItem key={consultor} value={consultor}>
                  {consultor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={disabled}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          🚀 Gerar Análise Expert
        </Button>
        <Button
          onClick={handleClear}
          disabled={disabled}
          variant="ghost"
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          🗑️ Limpar Formulário
        </Button>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="text-xs neon-border hover:bg-primary/5"
        >
          <BookOpen className="w-3 h-3 mr-1" />
          🎯 Exemplo de Transcrição
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="text-xs neon-border hover:bg-primary/5"
        >
          <HelpCircle className="w-3 h-3 mr-1" />
          📖 Como usar o Expert System
        </Button>
      </div>
    </div>
  );
};
