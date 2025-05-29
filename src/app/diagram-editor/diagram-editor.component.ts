import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { DiagramModule, NodeModel, PointPortModel, PortVisibility, DiagramTools, DiagramComponent, Diagram, ConnectorModel, NodeConstraints } from '@syncfusion/ej2-angular-diagrams';
import { ConfigService } from '../services/config.service';
import { NodeConfigDialogComponent } from './node-config-dialog.component';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-diagram',
  imports: [DiagramModule, NodeConfigDialogComponent, CommonModule, NgIf],
  templateUrl: './diagram-editor.component.html',
  styleUrl: './diagram-editor.component.css',
})
export class DiagramEditorComponent implements OnChanges {
  @Input() chatInput!: string;
  @ViewChild('diagram') public diagram?: DiagramComponent;

  public tools: DiagramTools = DiagramTools.Default | DiagramTools.ZoomPan;
  public nodes: NodeModel[] = [];
  public connectors: ConnectorModel[] = [];
  nodeConfig: any = {};
  public ports: PointPortModel[] = [
    {
      id: 'modelPort',
      offset: { x: 0.3, y: 1 },
      visibility: PortVisibility.Visible,
    },
    {
      id: 'toolPort',
      offset: { x: 0.7, y: 1 },
      visibility: PortVisibility.Visible,
    },
    {
      id: 'chatPort',
      offset: { x: 0, y: 0.5 },
      visibility: PortVisibility.Visible,
    },
  ];

  selectedNode: NodeModel | null = null;
  showDialog = false;

  constructor(private configService: ConfigService) {
    this.initNodes();
  }

  ngOnChanges() {
    if (this.chatInput) {
      // TODO: trigger your agent-runner here
      console.log('ChatTrigger fired:', this.chatInput);
    }
  }

  initNodes() {
    // ChatTrigger node
    this.nodes.push({
      id: 'chatTrigger',
      width: 80,
      height: 80,
      offsetX: 150,
      offsetY: 150,
      shape: {
        type: 'Path',
        data: 'M 40 0 Q 0 0 0 40 L 0 60 Q 0 100 40 100 L 90 100 Q 100 100 100 90 L 100 10 Q 100 0 90 0 Z',
      },
      annotations: [{ content: 'Chat\nTrigger' }],
    });

    // Agent node
    this.nodes.push({
      id: 'agent',
      width: 200,
      height: 100,
      offsetX: 400,
      offsetY: 150,
      annotations: [
        { content: 'Agent', style: { color: 'white', fontSize: 14 } },
      ],
      style: { fill: '#333' },
      ports: this.ports,
    });

    // AzureOpenAI model node
    this.nodes.push({
      id: 'azureModel',
      width: 80,
      height: 80,
      offsetX: 400,
      offsetY: 300,
      shape: { type: 'Basic', shape: 'Ellipse' },
      annotations: [{ content: 'Azure\nOpenAI', style: { color: '#0078D4' } }],
    });

    // Fetch API tool node
    this.nodes.push({
      id: 'fetchApi',
      width: 80,
      height: 80,
      offsetX: 600,
      offsetY: 300,
      shape: { type: 'Basic', shape: 'Ellipse' },
      annotations: [{ content: 'Fetch\nAPI', style: { fontSize: 12 } }],
    });

    this.connectors = [
      {
        id: 'modelConn',
        sourceID: 'agent',
        sourcePortID: 'modelPort',
        targetID: 'azureModel',
        type: 'Bezier',
      },
      {
        id: 'toolConn',
        sourceID: 'agent',
        sourcePortID: 'toolPort',
        targetID: 'fetchApi',
        type: 'Bezier',
      },
      {
        id: 'chatConn',
        sourceID: 'chatTrigger',
        targetPortID: 'chatPort',
        targetID: 'agent',
        type: 'Bezier',
      },
    ];
  }

  getNodeDefaults(node: NodeModel) {
    node.constraints =
      (NodeConstraints.Default & ~NodeConstraints.Rotate) |
      NodeConstraints.HideThumbs;
    return node;
  }

  onNodeClick(args: any): void {
    if (args.count === 2 && args.element && args.actualObject) {
      this.selectedNode = args.element;
      this.nodeConfig = this.configService.get(args.element.id!) || {};
      this.showDialog = true;
    }
  }

  saveConfig(cfg: any) {
    if (this.selectedNode) {
      this.configService.save(this.selectedNode.id!, cfg);
      this.selectedNode.addInfo = cfg;
      this.closeDialog();
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.selectedNode = null;
  }
}