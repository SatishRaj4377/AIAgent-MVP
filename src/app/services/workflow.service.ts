import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DiagramComponent, NodeModel } from '@syncfusion/ej2-angular-diagrams';

export interface NodeState {
  id: string;
  status: 'idle' | 'loading' | 'done' | 'error';
}

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private diagram: DiagramComponent | null = null;

  private nodeStateSubject = new BehaviorSubject<NodeState[]>([]);
  nodeStates$ = this.nodeStateSubject.asObservable();

  private currentStates = new Map<string, NodeState['status']>();

  // Diagram registration
  registerDiagram(diagram: DiagramComponent) {
    this.diagram = diagram;
  }

  // Node visual status tracking
  setNodeState(id: string, status: NodeState['status']) {
    this.currentStates.set(id, status);
    this.nodeStateSubject.next(this.getStates());
  }

  reset() {
    this.currentStates.clear();
    this.nodeStateSubject.next([]);
  }

  private getStates(): NodeState[] {
    return Array.from(this.currentStates.entries()).map(([id, status]) => ({ id, status }));
  }

  // Port & connection utilities
  isPortConnected(nodeId: string, portId: string): boolean {
    if (!this.diagram) return false;
    return this.diagram.connectors.some(c =>
      c.sourceID === nodeId && c.sourcePortID === portId
    );
  }

  getConnectedToolNodes(): NodeModel[] {
    if (!this.diagram) return [];
    return this.diagram.connectors
      .filter(c => c.sourceID === 'agent' && c.sourcePortID === 'toolPort')
      .map(c => this.diagram!.getObject(c.targetID as any))
      .filter(Boolean) as NodeModel[];
  }

  getNodeById(id: string): NodeModel | null {
    return this.diagram?.getObject(id) as NodeModel ?? null;
  }
}
