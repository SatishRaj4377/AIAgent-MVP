import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
@Component({
  selector: 'app-chat-window',
  imports: [ButtonModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css',
})
export class ChatWindowComponent {
  @Output() chat = new EventEmitter<string>();
  send(val: string) {
    if (val?.trim()) this.chat.emit(val);
  }
}
