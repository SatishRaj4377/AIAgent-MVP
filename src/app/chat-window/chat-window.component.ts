import { Component, ViewChild } from '@angular/core';
import {
  AIAssistViewComponent,
  AIAssistViewModule,
  PromptRequestEventArgs,
} from '@syncfusion/ej2-angular-interactive-chat';
import { AzureOpenAIService } from '../services/azure-open-aiservice.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-chat-window',
  imports: [AIAssistViewModule],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
})
export class ChatWindowComponent {
  @ViewChild('aiAssistViewComponent', { static: true })
  public aiAssistViewComponent!: AIAssistViewComponent;

  constructor(
    private azureService: AzureOpenAIService,
    private configService: ConfigService
  ) {}
  public async onPromptRequest(args: PromptRequestEventArgs): Promise<void> {
    const prompt = args.prompt?.trim();
    if (!prompt) return;

    const azure = this.configService.get('azureModel');
    const api = this.configService.get('fetchApi');
    const agent = this.configService.get('agent');
    const systemMessage =
      agent?.systemMessage?.trim() || 'You are an AI assistant.';

    if (!azure?.endpoint || !azure?.key || !azure?.deploymentName) {
      this.aiAssistViewComponent.addPromptResponse(
        'Please configure Azure OpenAI properly.'
      );
      return;
    }

    let toolContext = '';
    try {
      if (api?.apiUrl) {
        const apiData = await fetch(api.apiUrl).then((r) => r.json());
        toolContext += `Tool: Fetch API\nData:\n${JSON.stringify(
          apiData,
          null,
          2
        )}\n\n`;
      }

      // Future placeholder: Excel, DB, etc.
      // if (excel?.sheetUrl) { ... }
    } catch (err) {
      console.error('Error fetching tool data:', err);
      this.aiAssistViewComponent.addPromptResponse(
        'Error while fetching tool data.'
      );
      return;
    }

    // Compose full AI context
    const fullContext = `${systemMessage}\n\n${toolContext}User query: ${prompt}`;

    try {
      const response = await this.azureService.generateResponse(fullContext, {
        endpoint: azure.endpoint,
        key: azure.key,
        deploymentName: azure.deploymentName,
      });

      this.aiAssistViewComponent.addPromptResponse(response);
    } catch (err) {
      console.error('Azure AI error:', err);
      this.aiAssistViewComponent.addPromptResponse(
        'Something went wrong while processing your chat.'
      );
    }
  }
}
