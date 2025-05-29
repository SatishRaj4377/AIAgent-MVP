import { Component, ViewEncapsulation } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { DiagramEditorComponent } from './diagram-editor/diagram-editor.component';
import { PaletteComponent } from './palette/palette.component';

@Component({
  selector: 'app-root',
  imports: [ChatWindowComponent, DiagramEditorComponent, PaletteComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
}
