import { CheckCircle2, Download, RotateCw, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface ResultData {
  cliente: string;
  consultor: string;
  dataProcessamento: string;
  referenciaArquivo: string;
  metricas: {
    paginas: number;
    exemplos: number;
    prompts: number;
    acoes: number;
  };
}

interface ResultCardProps {
  data: ResultData;
  onDownload: () => void;
  onNewAnalysis: () => void;
  onViewSummary: () => void;
}

export const ResultCard = ({ data, onDownload, onNewAnalysis, onViewSummary }: ResultCardProps) => {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-secondary animate-pulse-glow" />
        <p className="text-lg font-semibold text-secondary">
          🎉 Expert System concluído com sucesso!
        </p>
      </div>

      <Card className="p-6 neon-border bg-card/50 backdrop-blur-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Análise Expert Completa</h3>
          <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30">
            <span className="text-sm font-semibold text-secondary">✅ APROVADO</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Cliente</p>
            <p className="font-semibold">{data.cliente}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Consultor</p>
            <p className="font-semibold">{data.consultor}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Data de Processamento</p>
            <p className="font-mono text-sm">{data.dataProcessamento}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Referência do arquivo</p>
            <p className="font-mono text-sm truncate">{data.referenciaArquivo}</p>
          </div>
        </div>

        <div className="h-px bg-border"></div>

        <div>
          <p className="text-sm font-semibold mb-4 text-primary">Métricas Geradas</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 neon-border text-center">
              <p className="text-2xl font-bold text-primary">{data.metricas.paginas}</p>
              <p className="text-xs text-muted-foreground mt-1">Páginas do PDF</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 neon-border text-center">
              <p className="text-2xl font-bold text-primary">{data.metricas.exemplos}</p>
              <p className="text-xs text-muted-foreground mt-1">Exemplos práticos</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 neon-border text-center">
              <p className="text-2xl font-bold text-primary">{data.metricas.prompts}</p>
              <p className="text-xs text-muted-foreground mt-1">Prompts otimizados</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 neon-border text-center">
              <p className="text-2xl font-bold text-primary">{data.metricas.acoes}</p>
              <p className="text-xs text-muted-foreground mt-1">Itens do plano</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onDownload}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground neon-glow"
          >
            <Download className="w-4 h-4 mr-2" />
            📥 Baixar PDF Completo
          </Button>
          <Button
            onClick={onNewAnalysis}
            variant="outline"
            className="flex-1 neon-border hover:bg-primary/5"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            🔄 Nova Análise
          </Button>
          <Button
            onClick={onViewSummary}
            variant="ghost"
            className="hover:bg-card"
          >
            <FileText className="w-4 h-4 mr-2" />
            📋 Ver Resumo Executivo
          </Button>
        </div>
      </Card>
    </div>
  );
};
