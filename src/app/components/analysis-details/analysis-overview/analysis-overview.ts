import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Added for form
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule } from 'ng-zorro-antd/modal'; // Added Modal
import { NzFormModule } from 'ng-zorro-antd/form';   // Added Form UI
import { NzInputModule } from 'ng-zorro-antd/input'; // Added Input

interface NewAnalysis {
  name: string;
  description: string;
  createdAt: Date;
  status: 'Inactive';
}

@Component({
  selector: 'app-analysis-overview',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, NzCardModule, NzStatisticModule,
    NzTableModule, NzTagModule, NzProgressModule, NzButtonModule, NzIconModule,
    NzDividerModule, NzBadgeModule, NzSpinModule, NzModalModule, NzFormModule, NzInputModule
  ],
  templateUrl: './analysis-overview.html',
  styleUrl: './analysis-overview.css'
})
export class AnalysisOverview implements OnInit {
  systemId: string = '';
  loading = true;
  isModalVisible = false;
  analysisForm: FormGroup;

  analysisData = {
    lastRun: new Date().toISOString(),
    blockCount: 156,
    flowCount: 84,
    accuracy: 99.4
  };

  // List of newly created analyses
  pendingAnalyses: NewAnalysis[] = [];

  analysisHistory = [
    { id: 'RUN-402', date: '2024-04-07', blocks: 156, flows: 84, accuracy: 99.4, status: 'Completed' },
    { id: 'RUN-398', date: '2024-04-01', blocks: 150, flows: 80, accuracy: 98.1, status: 'Completed' },
    { id: 'RUN-350', date: '2024-03-20', blocks: 142, flows: 75, accuracy: 85.0, status: 'Warning' },
  ];

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.analysisForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.systemId = params.get('systemId') || 'SYS-DEFAULT';
      setTimeout(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }, 600);
    });
  }

  showCreateModal(): void {
    this.isModalVisible = true;
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.analysisForm.reset();
  }

  submitAnalysis(): void {
    if (this.analysisForm.valid) {
      const newEntry: NewAnalysis = {
        name: this.analysisForm.value.name,
        description: this.analysisForm.value.description,
        createdAt: new Date(),
        status: 'Inactive'
      };

      this.pendingAnalyses.unshift(newEntry);
      this.isModalVisible = false;
      this.analysisForm.reset();
      this.cdr.detectChanges();
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }
}