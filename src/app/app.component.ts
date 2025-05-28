import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { DiagramEditorComponent } from './diagram-editor/diagram-editor.component';
import { ConfigService } from './services/config.service';
import { AzureOpenAIService } from './services/azure-open-aiservice.service';

@Component({
  selector: 'app-root',
  imports: [ChatWindowComponent, DiagramEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  lastChat: string = '';

  constructor(
    private configService: ConfigService,
    private azureService: AzureOpenAIService
  ) {}

  async onChat(message: string) {
    this.lastChat = message;

    const azure = this.configService.get('azureModel');
    const api = this.configService.get('fetchApi');

    if (
      !azure?.endpoint ||
      !azure?.key ||
      !azure?.deploymentName ||
      !api?.apiUrl
    ) {
      alert('Please configure Azure and Fetch API nodes properly.');
      return;
    }

    try {
      const apiData = await fetch(api.apiUrl).then((res) => res.json());

      const context = `You are an AI agent. Based on the following API data:\n\n${JSON.stringify(
        apiData,
        null,
        2
      )}\n\nUser query: ${message}`;

      const aiResponse = await this.azureService.generateResponse(context, {
        endpoint: azure.endpoint,
        key: azure.key,
        deploymentName: azure.deploymentName,
      });

      console.log('AI Response:', aiResponse);
      // optionally: pass to diagram/chat display
    } catch (err) {
      console.error('AI Chat Error:', err);
      alert('Something went wrong while processing your chat.');
    }
  }
}
