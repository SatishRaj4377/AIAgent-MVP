import { Component, ViewChild } from '@angular/core';
import {
  AIAssistViewComponent,
  AIAssistViewModule,
  PromptRequestEventArgs,
} from '@syncfusion/ej2-angular-interactive-chat';
import { AzureOpenAIService } from '../services/azure-open-aiservice.service';
import { ConfigService } from '../services/config.service';
import { WorkflowService } from '../services/workflow.service';

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
    private configService: ConfigService,
    private workflowService: WorkflowService
  ) {}

  async onPromptRequest(args: PromptRequestEventArgs) {
    const prompt = args.prompt?.trim();
    if (!prompt) return;

    this.workflowService.reset();
    this.workflowService.setNodeState('chatTrigger', 'loading');
    await this.delay(300);
    this.workflowService.setNodeState('chatTrigger', 'done');

    this.workflowService.setNodeState('agent', 'loading');

    const azure = this.configService.get('azureModel');
    const agent = this.configService.get('agent');

    const modelConnected = this.workflowService.isPortConnected(
      'agent',
      'modelPort'
    ); // keep this method
    const toolNodes = this.workflowService.getConnectedToolNodes(); // keep this method

    if (
      !modelConnected ||
      !azure?.endpoint ||
      !azure?.key ||
      !azure?.deploymentName
    ) {
      this.workflowService.setNodeState('agent', 'error');
      this.aiAssistViewComponent.addPromptResponse(
        '❌ Azure is not connected to agent.'
      );
      return;
    }

    this.workflowService.setNodeState('azureModel', 'loading');

    const toolContext = [];
    for (const tool of toolNodes) {
      this.workflowService.setNodeState(tool.id as any, 'loading');
      const toolCfg = this.configService.get(tool.id as any);
      if (tool.id === 'fetchApi' && toolCfg?.apiUrl) {
        try {
          const data = await fetch(toolCfg.apiUrl).then((r) => r.json());
          toolContext.push(
            `Tool: Fetch API\nData:\n${JSON.stringify(data, null, 2)}`
          );
          this.workflowService.setNodeState(tool.id, 'done');
        } catch {
          this.workflowService.setNodeState(tool.id, 'error');
        }
      }
    }

    const context = `${
      agent?.systemMessage || 'You are an AI agent.'
    }\n\n${toolContext.join('\n\n')}\n\nUser query: ${prompt}`;

    try {
      const response = await this.azureService.generateResponse(context, {
        endpoint: azure.endpoint,
        key: azure.key,
        deploymentName: azure.deploymentName,
      });
      this.workflowService.setNodeState('azureModel', 'done');
      this.workflowService.setNodeState('agent', 'done');
      this.aiAssistViewComponent.addPromptResponse(response);
    } catch {
      this.workflowService.setNodeState('azureModel', 'error');
      this.workflowService.setNodeState('agent', 'error');
      this.aiAssistViewComponent.addPromptResponse(
        '❌ Azure OpenAI call failed.'
      );
    }
  }
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
