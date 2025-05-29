import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  DiagramModule,
  NodeModel,
  PointPortModel,
  PortVisibility,
  DiagramTools,
  DiagramComponent,
  Diagram,
  ConnectorModel,
  NodeConstraints,
  AnnotationConstraints,
} from '@syncfusion/ej2-angular-diagrams';
import { ConfigService } from '../services/config.service';
import { NodeConfigDialogComponent } from './node-config-dialog.component';
import { CommonModule, NgIf } from '@angular/common';
import { NodeState, WorkflowService } from '../services/workflow.service';

@Component({
  selector: 'app-diagram',
  imports: [DiagramModule, NodeConfigDialogComponent, CommonModule, NgIf],
  templateUrl: './diagram-editor.component.html',
  styleUrl: './diagram-editor.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class DiagramEditorComponent
  implements OnChanges, OnInit, AfterViewInit
{
  @Input() chatInput!: string;
  @ViewChild('diagram') public diagram?: DiagramComponent;

  public tools: DiagramTools = DiagramTools.Default | DiagramTools.ZoomPan;
  public nodes: NodeModel[] = [];
  public connectors: ConnectorModel[] = [];
  public ports: PointPortModel[] = [
    {
      id: 'modelPort',
      offset: { x: 0.3, y: 1 },
      visibility: PortVisibility.Visible,
      shape: 'Circle',
      style: {
        fill: 'gray',
        strokeColor: 'transparent',
      },
    },
    {
      id: 'toolPort',
      offset: { x: 0.7, y: 1 },
      visibility: PortVisibility.Visible,
      shape: 'Circle',
      style: {
        fill: 'gray',
        strokeColor: 'transparent',
      },
    },
    {
      id: 'chatPort',
      offset: { x: 0, y: 0.5 },
    },
  ];
  nodeConfig: any = {};
  executingNodes: Set<string> = new Set();
  selectedNode: NodeModel | null = null;
  showDialog = false;

  constructor(
    private configService: ConfigService,
    private workflowService: WorkflowService
  ) {
    this.initNodes();
  }

  ngOnInit() {
    this.workflowService.nodeStates$.subscribe((states) => {
      states.forEach((state) => this.applyNodeVisualState(state));
    });
  }
  ngOnChanges() {
    if (this.chatInput) {
      console.log('ChatTrigger fired:', this.chatInput);
    }
  }

  ngAfterViewInit(): void {
    this.workflowService.registerDiagram(this.diagram as any);
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
      shape: { type: 'Basic', shape: 'Rectangle', cornerRadius: 10 },
      annotations: [
        {
          content: 'AI Agent',
          style: { color: 'white', fontSize: 14 },
          offset: { x: 0.5, y: 0.4 },
        },
        {
          content: 'Chat Model',
          style: { color: '#e3e3e3', fontSize: 11 },
          offset: { x: 0.3, y: 0.8 },
        },
        {
          content: 'Tools',
          style: { color: '#e3e3e3', fontSize: 11 },
          offset: { x: 0.7, y: 0.8 },
        },
      ],
      style: { fill: '#333' },
      ports: this.ports,
    });

    // AzureOpenAI model node
    this.nodes.push({
      id: 'azureModel',
      width: 80,
      height: 80,
      offsetX: 200,
      offsetY: 300,
      shape: { type: 'Basic', shape: 'Ellipse' },
      annotations: [{ content: 'Azure\nOpenAI', style: { color: '#0078D4' } }],
    });

    // Fetch API tool node
    this.nodes.push({
      id: 'fetchApi',
      width: 80,
      height: 80,
      offsetX: 400,
      offsetY: 300,
      shape: { type: 'Basic', shape: 'Ellipse' },
      annotations: [{ content: 'Fetch\nAPI', style: { fontSize: 12 } }],
    });

    // Scheduler Node
    this.nodes.push({
      id: 'scheduler',
      width: 80,
      height: 80,
      offsetX: 600,
      offsetY: 300,
      shape: { type: 'Basic', shape: 'Ellipse' },
      annotations: [{ content: 'Scheduler', style: { fontSize: 12 } }],
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
      {
        id: 'schedulerConn',
        sourceID: 'agent',
        sourcePortID: 'toolPort',
        targetID: 'scheduler',
        type: 'Bezier',
      },
    ];
  }

  getNodeDefaults(node: NodeModel) {
    node.constraints =
      (NodeConstraints.Default & ~NodeConstraints.Rotate) |
      NodeConstraints.HideThumbs;
    node.annotations?.forEach((annotation) => {
      annotation.constraints = AnnotationConstraints.ReadOnly;
    });
    return node;
  }

  onNodeClick(args: any): void {
    if (args.count === 2 && args.element && args.actualObject && args.element.id != "chatTrigger") {
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

  applyNodeVisualState(state: NodeState): void {
    const node = this.diagram?.getObject(state.id) as NodeModel;
    if (!node) return;

    const colorMap: Record<NodeState['status'], string> = {
      idle: '#333',
      loading: '#ffe082', // yellow
      done: '#4caf50', // green
      error: '#e57373', // red
    };

    node.style = node.style || {};
    node.style.fill = colorMap[state.status];
    this.diagram?.dataBind();
  }
}
