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
  // Reference to the AI chat component for adding responses
  @ViewChild('aiAssistViewComponent', { static: true })
  public aiAssistViewComponent!: AIAssistViewComponent;

  constructor(
    private azureService: AzureOpenAIService,
    private configService: ConfigService,
    private workflowService: WorkflowService
  ) {}

  // Handle user prompt requests and process them through the workflow
  async onPromptRequest(args: PromptRequestEventArgs) {
    const userPrompt = args.prompt?.trim();
    if (!userPrompt) return;

    // Reset workflow and start chat trigger
    this.workflowService.reset();
    this.workflowService.setNodeState('chatTrigger', 'loading');
    await this.delay(300);
    this.workflowService.setNodeState('chatTrigger', 'done');

    // Start agent processing
    this.workflowService.setNodeState('agent', 'loading');

    // Get configuration for Azure model and agent
    const azureModelConfig = this.configService.get('azureModel');
    const agentConfig = this.configService.get('agent');

    // Check if model is connected and Azure config is valid
    const isModelConnected = this.workflowService.isPortConnected(
      'agent',
      'modelPort'
    );
    const connectedToolNodes = this.workflowService.getConnectedToolNodes();

    // Validate Azure connection and configuration
    if (
      !isModelConnected ||
      !azureModelConfig?.endpoint ||
      !azureModelConfig?.key ||
      !azureModelConfig?.deploymentName
    ) {
      this.workflowService.setNodeState('agent', 'error');
      this.aiAssistViewComponent.addPromptResponse(
        '❌ Azure is not connected to agent.'
      );
      return;
    }

    // Start Azure model processing
    this.workflowService.setNodeState('azureModel', 'loading');

    // Collect context from all connected tools
    const toolContextData = [];
    for (const toolNode of connectedToolNodes) {
      this.workflowService.setNodeState(toolNode.id as any, 'loading');
      const toolConfiguration = this.configService.get(toolNode.id as any);
      
      // Process Fetch API tool
      if (toolNode.id === 'fetchApi' && toolConfiguration?.apiUrl) {
        try {
          const apiData = await fetch(toolConfiguration.apiUrl).then((response) => response.json());
          toolContextData.push(
            `Tool: Fetch API\nData:\n${JSON.stringify(apiData, null, 2)}`
          );
          this.workflowService.setNodeState(toolNode.id, 'done');
        } catch {
          this.workflowService.setNodeState(toolNode.id, 'error');
        }
      }
      
      // Process Scheduler tool
      if (toolNode.id === 'scheduler' && toolConfiguration?.events?.length > 0) {
        const scheduledPlans = toolConfiguration.events
          .map(
            (event: any) =>
              `• ${event.Subject} on ${new Date(event.StartTime).toLocaleString()}`
          )
          .join('\n');
        toolContextData.push(`Tool: Scheduler\nScheduled Plans:\n${scheduledPlans}`);
        this.workflowService.setNodeState(toolNode.id, 'done');
      }
      
      // Process Spreadsheet tool
      if (
        toolNode.id === 'spreadsheet' &&
        toolConfiguration?.spreadsheetData?.jsonObject?.Workbook?.sheets
      ) {
        const worksheets = toolConfiguration.spreadsheetData.jsonObject.Workbook.sheets;
        const sheetTextData: string[] = [];

        // Process each worksheet
        for (const worksheet of worksheets) {
          const worksheetRows = worksheet.rows || [];
          const rowLines: string[] = [];

          // Process each row in the worksheet
          for (const row of worksheetRows) {
            const rowCells = row.cells || [];
            const cellValues = rowCells
              .map((cell: any) => cell?.value ?? '')
              .filter((cellValue: string) => cellValue !== '');
            
            if (cellValues.length > 0) {
              rowLines.push(cellValues.join(' | '));
            }
          }

          // Add worksheet data if it has content
          if (rowLines.length > 0) {
            sheetTextData.push(
              `Sheet: ${worksheet.name || 'Unnamed'}\n${rowLines.join('\n')}`
            );
          }
        }

        // Add spreadsheet context
        if (sheetTextData.length > 0) {
          toolContextData.push(`Tool: Spreadsheet\n${sheetTextData.join('\n\n')}`);
        } else {
          toolContextData.push(`Tool: Spreadsheet\n(No visible data)`);
        }

        this.workflowService.setNodeState(toolNode.id, 'done');
      }
    }

    // Build complete context for AI model
    const completeContext = `${
      agentConfig?.systemMessage || 'You are an AI agent.'
    }\n\n${toolContextData.join('\n\n')}\n\nUser query: ${userPrompt}`;

    // Send request to Azure OpenAI and handle response
    try {
      const aiResponse = await this.azureService.generateResponse(completeContext, {
        endpoint: azureModelConfig.endpoint,
        key: azureModelConfig.key,
        deploymentName: azureModelConfig.deploymentName,
      });
      
      // Mark successful completion
      this.workflowService.setNodeState('azureModel', 'done');
      this.workflowService.setNodeState('agent', 'done');
      this.aiAssistViewComponent.addPromptResponse(aiResponse);
    } catch {
      // Handle Azure OpenAI call failure
      this.workflowService.setNodeState('azureModel', 'error');
      this.workflowService.setNodeState('agent', 'error');
      this.aiAssistViewComponent.addPromptResponse(
        '❌ Azure OpenAI call failed.'
      );
    }
  }

  // Helper method to add delay for better user experience
  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}