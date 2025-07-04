import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  AfterViewInit
} from '@angular/core';
import { NodeModel } from '@syncfusion/ej2-angular-diagrams';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ScheduleComponent,
  ScheduleModule,
  DayService,
  WeekService,
  WorkWeekService,
  MonthService,
  AgendaService,
  ResizeService,
  DragAndDropService
} from '@syncfusion/ej2-angular-schedule';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import {
  SpreadsheetComponent,
  SpreadsheetAllModule
} from '@syncfusion/ej2-angular-spreadsheet';

@Component({
  selector: 'app-node-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ScheduleModule,
    SpreadsheetAllModule,
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

          <!-- Spreadsheet -->
          <div *ngSwitchCase="'spreadsheet'">
            <ejs-spreadsheet
              #spreadsheetObj
              [height]="'400px'"
              [width]="'100%'"
              [openUrl]="
                'https://services.syncfusion.com/angular/production/api/spreadsheet/open'
              "
              [saveUrl]="
                'https://services.syncfusion.com/angular/production/api/spreadsheet/save'
              "
              (created)="onSpreadsheetCreated()"
            >
            </ejs-spreadsheet>
            <div class="e-footer-content">
              <button ejs-button cssClass="e-primary" (click)="onSave()">
                Save
              </button>
            </div>
          </div>

          <!-- Default -->
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
      .e-footer-content {
        margin-top: 0.8rem;
        text-align: right;
      }
    `,
  ],
})
export class NodeConfigDialogComponent implements OnInit, AfterViewInit {
  @Input() node!: NodeModel | null;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('schedulerObj') schedulerObj!: ScheduleComponent;
  @ViewChild('spreadsheetObj') spreadsheetObj!: SpreadsheetComponent;

  cfg: any = {};
  localEvents: any[] = [];
  selectedDate: Date = new Date();
  spreadsheetJson: any = null;

  ngOnInit(): void {
    if (!this.node) return;

    this.cfg = { ...(this.node.addInfo || {}) };
    // Default value for azure credentials
    this.cfg.endpoint = this.cfg.endpoint || 'https://karkuvelmindmapaiservice.openai.azure.com/';
    this.cfg.key = this.cfg.key || 'ea8e6945340144d5a50b34b1a0d3bcac';
    this.cfg.deploymentName = this.cfg.deploymentName || 'GPT-35-Turbo';

    if (this.node.id === 'scheduler') {
      this.localEvents = [...(this.cfg.events || [])];
    }

    if (this.node.id === 'spreadsheet') {
      this.spreadsheetJson = this.cfg.spreadsheetData || null;
    }
  }

  ngAfterViewInit(): void {
    if (this.node?.id === 'scheduler' && this.schedulerObj) {
      this.schedulerObj.eventSettings = { dataSource: this.localEvents };
      this.schedulerObj.refreshEvents();
    }
  }

  onSpreadsheetCreated() {
    if (this.spreadsheetJson && this.spreadsheetObj) {
      setTimeout(() => {
        try {
          const workbook = this.spreadsheetJson?.jsonObject?.Workbook;
          if (workbook?.sheets?.length > 0) {
            this.spreadsheetObj.openFromJson({file: this.spreadsheetJson.jsonObject});
          }
        } catch (error) {
          console.error('Error loading spreadsheet data:', error);
        }
      }, 200);
    }
  }

  onSave(): void {
    if (!this.node) return;

    if (this.node.id === 'spreadsheet') {
      if (!this.spreadsheetObj) {
        alert('Spreadsheet not initialized.');
        return;
      }

      if (this.spreadsheetObj.isEdit) {
        this.spreadsheetObj.endEdit();
      }

      setTimeout(() => {
        this.spreadsheetObj.saveAsJson().then((jsonData: any) => {
          this.cfg.spreadsheetData = jsonData;
          this.save.emit(this.cfg);
        }).catch((error: any) => {
          console.error('Error saving spreadsheet:', error);
          alert('Error saving spreadsheet data.');
        });
      });

      return;
    }

    if (this.node.id === 'scheduler') {
      this.cfg.events = [...this.localEvents];
    }

    this.save.emit(this.cfg);
  }

  onClose(): void {
    this.close.emit();
  }

  get dialogWidth(): string {
    return ['spreadsheet', 'scheduler'].includes(this.node?.id || '')
      ? '85%'
      : '400px';
  }

  get dialogHeader(): string {
    switch (this.node?.id) {
      case 'agent':
        return 'Configure Agent';
      case 'fetchApi':
        return 'Configure API Call';
      case 'azureModel':
        return 'Configure Azure OpenAI';
      case 'scheduler':
        return 'Configure Scheduler';
      case 'spreadsheet':
        return 'Configure Spreadsheet';
      default:
        return 'Configure Node';
    }
  }
}