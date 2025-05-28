import { Component, ViewChild } from '@angular/core';
import { AIAssistViewComponent, AIAssistViewModule, PromptRequestEventArgs } from '@syncfusion/ej2-angular-interactive-chat';
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

  public onPromptRequest(args: PromptRequestEventArgs): void {
    const prompt = args.prompt;

    const azure = this.configService.get('azureModel');
    const api = this.configService.get('fetchApi');

    if (!azure?.endpoint || !azure?.key || !azure?.deploymentName || !api?.apiUrl) {
      this.aiAssistViewComponent.addPromptResponse('Please configure Azure and Fetch API nodes properly.');
      return;
    }

    fetch(api.apiUrl)
      .then((res) => res.json())
      .then((apiData) => {
        const context = `You are an AI agent. Based on the following API data:\n\n${JSON.stringify(apiData, null, 2)}\n\nUser query: ${prompt}`;
        return this.azureService.generateResponse(context, {
          endpoint: azure.endpoint,
          key: azure.key,
          deploymentName: azure.deploymentName,
        });
      })
      .then((response) => {
        this.aiAssistViewComponent.addPromptResponse(response);
      })
      .catch((err) => {
        console.error('AI Chat Error:', err);
        this.aiAssistViewComponent.addPromptResponse('Something went wrong while processing your chat.');
      });
  }
}
