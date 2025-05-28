import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NodeModel } from '@syncfusion/ej2-angular-diagrams';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-node-config-dialog',
  standalone: true,
  imports: [DialogModule, FormsModule, CommonModule],
  template: `
  <ejs-dialog header="Configure {{node?.id}}" [visible]="true" width="300px" (close)="onClose()" [showCloseIcon]="true" (overlayClick)="onClose()">
    <div *ngIf="node">
      <ng-container [ngSwitch]="node.id">
        <!-- Azure Model -->
        <div *ngSwitchCase="'azureModel'">
          <label>Endpoint URL:</label>
          <input [(ngModel)]="cfg.url" class="e-input" /><br/>
          <label>Key:</label>
          <input [(ngModel)]="cfg.key" class="e-input" type="password" />
        </div>
        <!-- Fetch API -->
        <div *ngSwitchCase="'fetchApi'">
          <label>API URL:</label>
          <input [(ngModel)]="cfg.apiUrl" class="e-input" />
        </div>
        <!-- Agent & ChatTrigger could be extended -->
        <div *ngSwitchDefault>
          <p>No config needed</p>
        </div>
      </ng-container>
    </div>
    <div class="e-footer-content">
      <button ejs-button cssClass="e-primary" (click)="onSave()">Save</button>
    </div>
  </ejs-dialog>
  `,
  styles: [`.e-input { width:100%; margin-bottom:0.5rem; }`]
})
export class NodeConfigDialogComponent {
  @Input() node!: NodeModel|null;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  cfg: any = {};

  ngOnInit() {
    // load existing if any
    this.cfg = this.node?.addInfo || {};
  }

  onSave() {
    this.save.emit(this.cfg);
  }
  onClose() {
    this.close.emit();
  }
}
