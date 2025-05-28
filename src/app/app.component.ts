import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { DiagramEditorComponent } from './diagram-editor/diagram-editor.component';

@Component({
  selector: 'app-root',
  imports: [ChatWindowComponent, DiagramEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  lastChat: string = '';
  onChat(msg: string) {
    this.lastChat = msg;
  }
}
