const API_BASE_URL = "https://expert-system-analisador-de-calls-com-exemp-f432e8c8.crewai.com";
const BEARER_TOKEN = "27ca1ca2808f";

interface KickoffPayload {
  inputs: {
    file?: string; // base64 ou URL se suportado
    observacoes?: string;
    cliente: string;
    consultor: string;
    data_ref: string;
    webhook_url?: string;
  };
}

interface KickoffResponse {
  task_id: string;
  status: string;
}

interface StatusResponse {
  task_id: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  result?: any;
  error?: string;
  progress?: number;
}

export class CrewAIService {
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      "Authorization": `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
    };
  }

  async getInputs(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/inputs`, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to get inputs: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting inputs:", error);
      throw error;
    }
  }

  async kickoff(payload: KickoffPayload): Promise<KickoffResponse> {
    try {
      console.log("Sending kickoff payload:", JSON.stringify(payload, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/kickoff`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Kickoff error response:", errorText);
        throw new Error(`Failed to kickoff: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error starting crew:", error);
      throw error;
    }
  }

  async getStatus(taskId: string): Promise<StatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/status/${taskId}`, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to get status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting status:", error);
      throw error;
    }
  }

  async pollStatus(
    taskId: string,
    onProgress?: (status: StatusResponse) => void,
    intervalMs: number = 5000
  ): Promise<StatusResponse> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getStatus(taskId);
          
          if (onProgress) {
            onProgress(status);
          }

          if (status.status === "COMPLETED") {
            resolve(status);
            return;
          }

          if (status.status === "FAILED") {
            reject(new Error(status.error || "Task failed"));
            return;
          }

          // Continue polling
          setTimeout(poll, intervalMs);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove o prefixo data:application/...;base64,
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const crewAIService = new CrewAIService();
