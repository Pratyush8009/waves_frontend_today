import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// Ng-Zorro Imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';

interface ModelEntry {
  name: string;
  version: string;
  date: string;
  description: string;
}

@Component({
  selector: 'app-model-overview',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NzCardModule, NzDividerModule, NzTagModule,
    NzStatisticModule, NzIconModule, NzSpinModule, NzButtonModule,
    NzBadgeModule, NzModalModule, NzInputModule
  ],
  providers: [NzMessageService],
  templateUrl: './model-overview.html',
  styleUrl: './model-overview.css'
})
export class ModelOverview implements OnInit {
  systemId: string = '';
  loading = true;

  // Modal States
  isModalVisible = false;
  isCreating = false;
  newModelName = '';
  newModelDesc = '';

  // Metadata for the currently active state
  modelData = {
    activeModelName: 'Core Engine Logic',
    activeVersion: 'v2.4.0',
    blockCount: 156,
    flowCount: 84,
    updatedAt: new Date().toISOString()
  };

  // Static Models List
  models: ModelEntry[] = [
    {
      name: 'Core Engine Logic',
      version: 'v2.4.0',
      date: '2024-03-15',
      description: 'Main processing engine for system-wide logic and safety overrides.'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.systemId = params.get('systemId') || 'SYS-7700';

      setTimeout(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }, 600);
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  showCreateModal() {
    this.isModalVisible = true;
  }

  handleCancel() {
    this.isModalVisible = false;
    this.newModelName = '';
    this.newModelDesc = '';
  }

  handleCreate() {
    if (!this.newModelName.trim()) {
      this.message.warning('Model name is required');
      return;
    }

    this.isCreating = true;

    const newEntry: ModelEntry = {
      name: this.newModelName,
      version: 'v1.0.0', // Default version
      date: new Date().toISOString(),
      description: this.newModelDesc || 'No description provided.'
    };

    // Add to the list (it will be inactive because its name != activeModelName)
    this.models = [newEntry, ...this.models];

    this.isCreating = false;
    this.isModalVisible = false;
    this.message.success(`Model "${this.newModelName}" initialized at v1.0.0`);

    // Reset form
    this.newModelName = '';
    this.newModelDesc = '';
    this.cdr.detectChanges();

  }

  selectModel(name: string) {
    if (this.modelData.activeModelName === name) {
      this.message.info('Workspace already active');
    } else {
      this.modelData.activeModelName = name;
      // Update version display based on selected model
      const selected = this.models.find(m => m.name === name);
      if (selected) this.modelData.activeVersion = selected.version;

      this.message.loading(`Activating ${name}...`, { nzDuration: 800 });
    }
  }
}