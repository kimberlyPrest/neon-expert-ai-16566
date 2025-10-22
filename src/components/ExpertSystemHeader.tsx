import { Sparkles } from "lucide-react";

export const ExpertSystemHeader = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Sparkles className="w-10 h-10 text-primary animate-pulse-glow" />
          <div className="absolute inset-0 blur-xl bg-primary/30 -z-10"></div>
        </div>
        <div>
          <h1 className="text-3xl font-bold neon-text bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Expert System
          </h1>
          <p className="text-sm text-muted-foreground">
            Analisador de Calls com Exemplos Práticos
          </p>
        </div>
      </div>
      <div className="px-4 py-2 rounded-lg neon-border bg-card/50 backdrop-blur-sm">
        <span className="text-xs font-mono text-primary">EXPERT SYSTEM</span>
      </div>
    </div>
  );
};
