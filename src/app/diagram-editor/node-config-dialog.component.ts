import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NodeModel } from '@syncfusion/ej2-angular-diagrams';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScheduleComponent, ScheduleModule, DayService, WeekService, WorkWeekService, MonthService, AgendaService, ResizeService, DragAndDropService, } from '@syncfusion/ej2-angular-schedule';
import { ButtonComponent, ButtonModule } from '@syncfusion/ej2-angular-buttons';

@Component({
  selector: 'app-node-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ScheduleModule,
    ButtonModule,
  ],
  providers: [
    DayService,
    WeekService,
    WorkWeekService,
    MonthService,
    AgendaService,
    ResizeService,
    DragAndDropService,
  ],
  template: `
    <ejs-dialog
      [header]="dialogHeader"
      allowDragging="true"
      width="300px"
      [visible]="true"
      [width]="dialogWidth"
      (close)="onClose()"
      [isModal]="true"
      [showCloseIcon]="true"
      (overlayClick)="onClose()"
    >
      <div *ngIf="node">
        <ng-container [ngSwitch]="node.id">
          <!-- Azure Model -->
          <div *ngSwitchCase="'azureModel'">
            <label>Endpoint URL:</label>
            <input [(ngModel)]="cfg.endpoint" class="e-input" /><br />
            <label>Key:</label>
            <input [(ngModel)]="cfg.key" class="e-input" type="password" />
            <label>Model (Deployment) Name:</label>
            <input [(ngModel)]="cfg.deploymentName" class="e-input" /><br />
            <div class="e-footer-content">
              <button ejs-button cssClass="e-primary" (click)="onSave()">
                Save
              </button>
            </div>
          </div>

          <!-- Fetch API -->
          <div *ngSwitchCase="'fetchApi'">
            <label>API URL:</label>
            <input [(ngModel)]="cfg.apiUrl" class="e-input" />
            <div class="e-footer-content">
              <button ejs-button cssClass="e-primary" (click)="onSave()">
                Save
              </button>
            </div>
          </div>

          <!-- Agent -->
          <div *ngSwitchCase="'agent'">
            <label>System Message:</label>
            <textarea
              [(ngModel)]="cfg.systemMessage"
              rows="5"
              class="e-input"
            ></textarea>
            <div class="e-footer-content">
              <button ejs-button cssClass="e-primary" (click)="onSave()">
                Save
              </button>
            </div>
          </div>

          <!-- Scheduler -->
          <div *ngSwitchCase="'scheduler'">
            <ejs-schedule
              #schedulerObj
              width="100%"
              height="400px"
              [selectedDate]="selectedDate"
              [currentView]="'Day'"
              [eventSettings]="{ dataSource: localEvents }"
            >
            </ejs-schedule>

            <div class="e-footer-content">
              <button ejs-button cssClass="e-primary" (click)="onSave()">
                Save
              </button>
            </div>
          </div>

          <!-- Agent & ChatTrigger could be extended -->
          <div *ngSwitchDefault>
            <p>No config needed</p>
          </div>
        </ng-container>
      </div>
    </ejs-dialog>
  `,
  styles: [
    `
      .e-input {
        width: 100%;
        margin-bottom: 0.5rem;
      }
    `,
  ],
})
export class NodeConfigDialogComponent {
  @Input() node!: NodeModel | null;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('schedulerObj') schedulerObj!: ScheduleComponent;

  cfg: any = { events: [] };
  localEvents: any[] = [];
  selectedDate: Date = new Date();

  ngOnInit(): void {
    if (!this.node) return;

    this.cfg = Object.assign({}, this.node.addInfo || {});
    if (this.node.id === 'scheduler') {
      this.localEvents = [...(this.cfg.events || [])];
      if (this.schedulerObj) {
        this.schedulerObj.eventSettings = { dataSource: this.localEvents };
      }
    }
  }

  get dialogWidth(): string {
    return this.node?.id === 'scheduler' ? '85%' : '400px';
  }

  get dialogHeader(): string {
    switch (this.node?.id) {
      case 'agent':
        return 'Configure Agent';
      case 'fetchApi':
        return 'Configure HTTP Request';
      case 'azureModel':
        return 'Configure Azure OpenAI';
      case 'scheduler':
        return 'Configure Scheduler';
      default:
        return 'Configure Node';
    }
  }

  onSave(): void {
    if (this.node?.id === 'scheduler') {
      this.cfg.events = [...this.localEvents];
      if (this.schedulerObj) {
        this.schedulerObj.eventSettings.dataSource = this.localEvents;
        this.schedulerObj.refreshEvents();
      }
    }
    this.save.emit(this.cfg);
  }

  onClose() {
    this.close.emit();
  }
}
