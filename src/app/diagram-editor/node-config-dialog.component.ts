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

    // Set default system message for personal finance assistant
    if (this.node.id === 'agent' && !this.cfg.systemMessage) {
      this.cfg.systemMessage = `You are Maya, a Personal Finance Assistant AI designed to help users manage their money, track expenses, and make informed financial decisions.

## YOUR ROLE:
- Personal Finance Advisor and Budget Tracker
- Friendly, knowledgeable, and proactive financial companion
- Data-driven insights provider with a focus on actionable advice

## GREETING & INTRODUCTION:
When a user first interacts with you or says hello, ALWAYS introduce yourself with:
"Hi! I'm Maya, your Personal Finance Assistant. How can I assist you with your personal finances today?"

Variations you can use:
- "Hello! I'm Maya, your AI finance companion. I can help you analyze your spending, check account balances, track budgets, and provide financial insights. What would you like to know about your finances?"
- "Hi

## YOUR CAPABILITIES:
You have access to the following tools:
1. **Bank Data API** - Real-time access to account balances, transactions, and spending patterns
2. **Expense Spreadsheet** - Historical spending data, budgets, and financial goals
3. **Calendar/Scheduler** - Upcoming bills, payment due dates, and financial milestones
4. **External APIs** - Market data, currency rates, and financial news when relevant

## YOUR TASKS:
- Analyze spending patterns and provide budget insights
- Track expenses across different categories (groceries, dining, utilities, etc.)
- Monitor account balances and alert about unusual transactions
- Provide spending summaries and comparisons to previous periods
- Suggest budget optimizations and savings opportunities
- Answer questions about financial data with specific numbers and context

## COMMUNICATION STYLE:
- Be conversational but professional
- Use specific numbers and percentages from actual data
- Provide context and comparisons (vs last month, vs budget, etc.)
- Offer actionable advice, not just data reporting
- Be encouraging about good financial habits
- Express concern (diplomatically) about overspending

## RESPONSE GUIDELINES:
1. **Always use real data** from available sources when answering questions
2. **Be specific** - include actual amounts, dates, and merchant names
3. **Provide context** - compare to budgets, previous periods, or averages
4. **Offer insights** - explain what the data means and why it matters
5. **Suggest actions** - what the user should do based on the information
6. **Stay focused** on financial topics and money management

## RESTRICTIONS:
- Do NOT provide investment advice or stock recommendations
- Do NOT access or discuss sensitive personal information beyond financial data
- Do NOT make assumptions about income sources or financial goals unless explicitly stated
- Do NOT provide tax advice or legal financial guidance
- NEVER share or reference specific account numbers or sensitive banking details
- If asked about non-financial topics, politely redirect to financial matters

## SAMPLE RESPONSES:
- "You've spent $339.75 on groceries this month, which is 15% under your $400 budget - great job staying on track!"
- "I noticed you had 4 grocery transactions this week totaling $250. Your usual weekly average is $85, so you're spending about 3x more than normal."
- "Your account balance is $3,420.50. With your rent payment of $1,200 due in 3 days, you'll have $2,220.50 remaining."

## ERROR HANDLING:
- If data is unavailable, explain what you cannot access and suggest alternatives
- If asked about future predictions, base responses on historical patterns with appropriate disclaimers
- If technical issues occur, acknowledge the problem and suggest trying again

Remember: Your goal is to help users make better financial decisions through clear, data-driven insights and practical advice. Be their trusted financial companion who always has their best interests in mind.
and Base all responses on the actual data provided through the connected tools (spreadsheet and bank API data).`;
    }

    // Set default values for Azure AI
    if (this.node.id === 'azureModel' && !this.cfg.endpoint) {
      this.cfg = {
        endpoint: 'https://karkuvelmindmapaiservice.openai.azure.com/',
        key: 'ea8e6945340144d5a50b34b1a0d3bcac',
        deploymentName: 'GPT-35-Turbo',
        ...this.cfg
      };
    }

    // Set default API URL for bank data
    if (this.node.id === 'fetchApi' && !this.cfg.apiUrl) {
      this.cfg.apiUrl = 'http://127.0.0.1:3000/api/bank-data.json';
    }

    // Add default scheduler events for financial planning
    if (this.node.id === 'scheduler' && (!this.cfg.events || this.cfg.events.length === 0)) {
        this.cfg.events = [
            // Monthly Recurring Events - July 2025
            {
              Id: 1,
              Subject: 'Monthly Budget Review',
              StartTime: new Date(2025, 6, 1, 9, 0), // July 1st, 2025
              EndTime: new Date(2025, 6, 1, 10, 0),
              IsAllDay: false,
              Category: 'Planning',
              Description: 'Review monthly spending and adjust budget categories'
            },
            {
              Id: 2,
              Subject: 'Rent Payment Due',
              StartTime: new Date(2025, 6, 1, 8, 0), // July 1st, 2025
              EndTime: new Date(2025, 6, 1, 8, 30),
              IsAllDay: false,
              Category: 'Bills',
              Description: 'Monthly rent payment - $1,200'
            },
            {
              Id: 3,
              Subject: 'Credit Card Payment Due - Chase',
              StartTime: new Date(2025, 6, 15, 10, 0), // July 15th, 2025
              EndTime: new Date(2025, 6, 15, 10, 30),
              IsAllDay: false,
              Category: 'Bills',
              Description: 'Minimum payment due: $150'
            },
            {
              Id: 4,
              Subject: 'Electricity Bill Due - PG&E',
              StartTime: new Date(2025, 6, 20, 11, 0), // July 20th, 2025
              EndTime: new Date(2025, 6, 20, 11, 15),
              IsAllDay: false,
              Category: 'Bills',
              Description: 'Average monthly bill: $180'
            },
            {
              Id: 5,
              Subject: 'Car Insurance Payment',
              StartTime: new Date(2025, 6, 25, 9, 0), // July 25th, 2025
              EndTime: new Date(2025, 6, 25, 9, 15),
              IsAllDay: false,
              Category: 'Bills',
              Description: 'Auto insurance premium: $120'
            },
            {
              Id: 6,
              Subject: 'Investment Portfolio Review',
              StartTime: new Date(2025, 6, 28, 14, 0), // July 28th, 2025
              EndTime: new Date(2025, 6, 28, 15, 0),
              IsAllDay: false,
              Category: 'Planning',
              Description: 'Quarterly review of investment performance'
            },
            // Weekly Events
            {
              Id: 7,
              Subject: 'Grocery Shopping Budget Check',
              StartTime: new Date(2025, 6, 3, 10, 0), // July 3rd, 2025
              EndTime: new Date(2025, 6, 3, 10, 30),
              IsAllDay: false,
              Category: 'Planning',
              Description: 'Weekly grocery budget: $85'
            },
            {
              Id: 8,
              Subject: 'Expense Tracking Update',
              StartTime: new Date(2025, 6, 7, 19, 0), // July 7th, 2025
              EndTime: new Date(2025, 6, 7, 19, 30),
              IsAllDay: false,
              Category: 'Planning',
              Description: 'Update expense spreadsheet with weekly transactions'
            },
            {
              Id: 9,
              Subject: 'Mid-Year Financial Review',
              StartTime: new Date(2025, 6, 15, 9, 0), // July 15th, 2025
              EndTime: new Date(2025, 6, 15, 17, 0),
              IsAllDay: true,
              Category: 'Planning',
              Description: 'Comprehensive mid-year financial assessment'
            },
            {
              Id: 10,
              Subject: 'Emergency Fund Goal Check',
              StartTime: new Date(2025, 6, 14, 15, 0), // July 14th, 2025
              EndTime: new Date(2025, 6, 14, 15, 30),
              IsAllDay: false,
              Category: 'Savings',
              Description: 'Review progress toward $10,000 emergency fund goal'
            },
            {
              Id: 11,
              Subject: 'Subscription Audit',
              StartTime: new Date(2025, 6, 10, 16, 0), // July 10th, 2025
              EndTime: new Date(2025, 6, 10, 17, 0),
              IsAllDay: false,
              Category: 'Planning',
              Description: 'Review all monthly subscriptions and cancel unused ones'
            },
            {
              Id: 12,
              Subject: 'Salary Direct Deposit',
              StartTime: new Date(2025, 6, 1, 0, 0), // July 1st, 2025
              EndTime: new Date(2025, 6, 1, 23, 59),
              IsAllDay: true,
              Category: 'Income',
              Description: 'Monthly salary deposit: $2,500'
            },
            {
              Id: 13,
              Subject: 'Summer Vacation Budget Planning',
              StartTime: new Date(2025, 6, 5, 10, 0), // July 5th, 2025
              EndTime: new Date(2025, 6, 5, 11, 0),
              IsAllDay: false,
              Category: 'Planning',
              Description: 'Plan and budget for summer vacation expenses'
            },
            {
              Id: 14,
              Subject: 'Quarterly Tax Payment Due',
              StartTime: new Date(2025, 6, 31, 12, 0), // July 31st, 2025
              EndTime: new Date(2025, 6, 31, 12, 30),
              IsAllDay: false,
              Category: 'Tax',
              Description: 'Q2 estimated tax payment deadline'
            }
        ];
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