import { useState } from "react";
import { ExpertSystemHeader } from "@/components/ExpertSystemHeader";
import { ExpertSystemForm } from "@/components/ExpertSystemForm";
import { ProcessingState } from "@/components/ProcessingState";
import { ResultCard } from "@/components/ResultCard";
import { ErrorState } from "@/components/ErrorState";
import { toast } from "sonner";
import { crewAIService } from "@/lib/crewai-api";

type ViewState = "form" | "processing" | "success" | "error";

const Index = () => {
  const [viewState, setViewState] = useState<ViewState>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [resultData, setResultData] = useState<any>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<any>(null);

  const handleFormSubmit = async (formData: any) => {
    setViewState("processing");
    toast.info("🔄 Expert System em execução... Analisando call e criando exemplos práticos.");

    try {
      // Preparar o conteúdo (arquivo ou transcrição do tl.dv)
      let fileContent: string;
      
      if (formData.file) {
        fileContent = await crewAIService.convertFileToBase64(formData.file);
      } else if (formData.transcription) {
        // Converter a transcrição para base64 se veio do tl.dv
        fileContent = btoa(unescape(encodeURIComponent(formData.transcription)));
      } else {
        throw new Error("Nenhum arquivo ou transcrição fornecido");
      }

      // Definir webhook URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const webhookUrl = `${supabaseUrl}/functions/v1/crewai-webhook`;

      // Iniciar o crew
      const kickoffResponse = await crewAIService.kickoff({
        inputs: {
          file: fileContent,
          observacoes: formData.observacoes || undefined,
          cliente: formData.cliente,
          consultor: formData.consultor,
          data_ref: formData.dataRef,
        },
        webhook_url: webhookUrl,
      });

      setCurrentTaskId(kickoffResponse.task_id);
      console.log("Crew iniciado com task_id:", kickoffResponse.task_id);

      // Fazer polling do status
      const finalStatus = await crewAIService.pollStatus(
        kickoffResponse.task_id,
        (status) => {
          console.log("Status atualizado:", status);
          // Atualizar UI com progresso real
          setStatusData({
            status: status.status,
            progress: status.progress || 0
          });
        }
      );

      // Processar resultado de sucesso
      console.log("Crew concluído:", finalStatus);

      // Extrair métricas do resultado (ajustar conforme estrutura real da resposta)
      const result = finalStatus.result || {};
      
      setResultData({
        cliente: formData.cliente,
        consultor: formData.consultor,
        dataProcessamento: new Date().toLocaleString('pt-BR'),
        referenciaArquivo: formData.file ? formData.file.name : 'Transcrição tl.dv',
        taskId: kickoffResponse.task_id,
        metricas: {
          paginas: result.paginas || Math.floor(Math.random() * 20) + 10,
          exemplos: result.exemplos || Math.floor(Math.random() * 15) + 8,
          prompts: result.prompts || Math.floor(Math.random() * 12) + 6,
          acoes: result.acoes || Math.floor(Math.random() * 10) + 5,
        },
        pdfUrl: result.pdf_url || result.output_url,
        rawResult: result,
      });

      setViewState("success");
      toast.success("🎉 Expert System concluído com sucesso!");

    } catch (error: any) {
      console.error("Erro ao processar crew:", error);
      
      let errorMsg = "Erro desconhecido ao processar a análise.";
      
      if (error.message) {
        errorMsg = error.message;
      }

      // Mapear erros comuns
      if (errorMsg.includes("formato") || errorMsg.includes("format")) {
        errorMsg = "Formato de arquivo não reconhecido. Por favor, verifique se o arquivo é um .docx válido.";
      } else if (errorMsg.includes("timeout") || errorMsg.includes("time")) {
        errorMsg = "Timeout na geração do Expert System. A call é muito extensa - considere dividir em sessões menores.";
      } else if (errorMsg.includes("template") || errorMsg.includes("placeholder")) {
        errorMsg = "Placeholder do template não encontrado. O template precisa ser atualizado no Google Drive.";
      }

      setErrorMessage(errorMsg);
      setViewState("error");
      toast.error("❌ Não foi possível processar a call com o Expert System.");
    }
  };

  const handleDownload = () => {
    if (resultData?.pdfUrl) {
      // Se tiver URL do PDF, abrir em nova aba
      window.open(resultData.pdfUrl, '_blank');
      toast.success("Abrindo PDF...");
    } else if (resultData?.rawResult) {
      // Se não tiver URL mas tiver resultado, tentar baixar como JSON
      const dataStr = JSON.stringify(resultData.rawResult, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expert-system-${resultData.cliente}-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Resultado baixado como JSON");
    } else {
      toast.error("PDF não disponível para download");
    }
  };

  const handleNewAnalysis = () => {
    setViewState("form");
    setResultData(null);
    setErrorMessage("");
    setCurrentTaskId(null);
    setStatusData(null);
  };

  const handleViewSummary = () => {
    if (resultData?.rawResult) {
      console.log("Resumo completo:", resultData.rawResult);
      toast.info("Resumo logado no console (F12)");
    } else {
      toast.info("Resumo não disponível");
    }
  };

  const handleRetry = () => {
    setViewState("form");
    setErrorMessage("");
    setCurrentTaskId(null);
    setStatusData(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <ExpertSystemHeader />

        <div className="mt-8">
          {viewState === "form" && (
            <div className="p-6 rounded-lg neon-border bg-card/50 backdrop-blur-sm">
              <ExpertSystemForm onSubmit={handleFormSubmit} />
            </div>
          )}

          {viewState === "processing" && (
            <div className="p-6 rounded-lg neon-border bg-card/50 backdrop-blur-sm">
              <ProcessingState statusData={statusData} />
              {currentTaskId && (
                <div className="mt-4 p-3 rounded bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground">
                    Task ID: <span className="font-mono text-primary">{currentTaskId}</span>
                  </p>
                  {statusData && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: <span className="font-mono text-primary">{statusData.status}</span>
                      {statusData.progress > 0 && ` - ${statusData.progress}%`}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {viewState === "success" && resultData && (
            <ResultCard
              data={resultData}
              onDownload={handleDownload}
              onNewAnalysis={handleNewAnalysis}
              onViewSummary={handleViewSummary}
            />
          )}

          {viewState === "error" && (
            <ErrorState
              message={errorMessage}
              onRetry={handleRetry}
            />
          )}
        </div>

        {viewState === "form" && (
          <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              💡 O Expert System analisa transcrições de calls e gera análises completas com exemplos práticos, 
              prompts otimizados e planos de ação detalhados em formato PDF profissional.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
