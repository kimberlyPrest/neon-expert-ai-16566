import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";

const AGENTS = [
  { id: 1, name: "Expert Analista", description: "processando transcrição...", duration: 60 },
  { id: 2, name: "Decisor", description: "definindo artefatos...", duration: 40 },
  { id: 3, name: "Gerador", description: "criando exemplos práticos...", duration: 50 },
  { id: 4, name: "Redator", description: "consolidando conteúdo...", duration: 45 },
  { id: 5, name: "Documentador", description: "gerando PDF...", duration: 30 },
  { id: 6, name: "Validador", description: "aprovando entrega final...", duration: 25 },
];

export const ProcessingState = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = AGENTS.reduce((sum, agent) => sum + agent.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 1;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 99);
      setProgress(newProgress);

      // Atualizar step baseado no progresso
      let accumulatedDuration = 0;
      for (let i = 0; i < AGENTS.length; i++) {
        accumulatedDuration += AGENTS[i].duration;
        if (elapsed < accumulatedDuration) {
          setCurrentStep(i);
          break;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentAgent = AGENTS[currentStep];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <div className="absolute inset-0 blur-2xl bg-primary/30 -z-10 animate-pulse"></div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-2">
            Analisando call e gerando exemplos práticos...
          </h3>
          <p className="text-sm text-muted-foreground">
            isso pode levar 3-5 minutos
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-mono text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {AGENTS.map((agent, index) => (
          <div
            key={agent.id}
            className={`
              p-4 rounded-lg border transition-all
              ${index === currentStep 
                ? 'border-primary bg-primary/5 neon-glow scale-105' 
                : index < currentStep 
                  ? 'border-secondary/30 bg-secondary/5' 
                  : 'border-border bg-card/30'
              }
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${index === currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : index < currentStep 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {index < currentStep ? '✓' : agent.id}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`
                  font-medium text-xs truncate
                  ${index === currentStep ? 'text-primary' : ''}
                `}>
                  {agent.name}
                </p>
                {index === currentStep && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {agent.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg bg-card/50 neon-border">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <p className="text-sm">
            <span className="text-primary font-semibold">🔍 {currentAgent.name}</span>
            <span className="text-muted-foreground"> {currentAgent.description}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
