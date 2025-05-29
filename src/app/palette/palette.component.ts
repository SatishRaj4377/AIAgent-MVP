import { Component, OnInit } from '@angular/core';
import { SymbolPaletteModule } from '@syncfusion/ej2-angular-diagrams';

@Component({
  selector: 'app-palette',
  imports: [ SymbolPaletteModule ],
  templateUrl: './palette.component.html',
  styleUrl: './palette.component.css',
})
export class PaletteComponent implements OnInit {
  public palettes!: Object[];

  ngOnInit(): void {
    this.palettes = [
      {
        id: 'Tools',
        expanded: true,
        symbols: [
          {
            id: 'chatTrigger',
            width: 50,
            height: 50,
            shape: {
              type: 'Path',
              data: 'M 40 0 Q 0 0 0 40 L 0 60 Q 0 100 40 100 L 90 100 Q 100 100 100 90 L 100 10 Q 100 0 90 0 Z'
            },
            annotations: [{ content: 'Chat\nTrigger' }]
          },
          {
            id: 'agent',
            width: 100,
            height: 50,
            shape: { type: 'Basic', shape: 'Rectangle', cornerRadius: 10 },
            annotations: [
              { content: 'Agent', style: { color: 'white', fontSize: 14 } }
            ],
            style: { fill: '#5f5d5d' }
          },
          {
            id: 'azureModel',
            width: 50,
            height: 50,
            style: {fill: '#a1e2ff'},
            shape: { type: 'Basic', shape: 'Ellipse' },
            annotations: [{ content: 'Azure\nOpenAI', style: { color: '#0078D4' } }]
          },
          {
            id: 'fetchApi',
            width: 50,
            height: 50,
            style: { fill: '#cbc0ff'},
            shape: { type: 'Basic', shape: 'Ellipse'  },
            annotations: [{ content: 'Fetch\nAPI', style: { fontSize: 12 } }]
          }
        ],
        title: 'Tools'
      }
    ];
  }
}
