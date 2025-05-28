import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class AzureOpenAIService {
  async generateResponse(
    prompt: string,
    config: { endpoint: string; key: string; deploymentName: string }
  ): Promise<string> {
    const { endpoint, key, deploymentName } = config;
    const fullUrl = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`;

    const response = await axios.post(
      fullUrl,
      {
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': key,
        },
      }
    );

    return response.data.choices?.[0]?.message?.content || 'No response.';
  }
}
