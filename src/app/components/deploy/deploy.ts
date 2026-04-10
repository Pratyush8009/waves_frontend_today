import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzCardModule } from 'ng-zorro-antd/card';

interface ValidationItem {
  label: string;
  status: 'pending' | 'success' | 'loading';
}
@Component({
  selector: 'app-deploy',
  imports: [CommonModule, NzButtonModule, NzIconModule, NzListModule, NzCardModule],
  templateUrl: './deploy.html',
  styleUrl: './deploy.css',
})
export class Deploy {
  // Signal state for the list
  validationSteps = signal<ValidationItem[]>([
    { label: 'System is Active', status: 'pending' },
    { label: 'System input schema defined', status: 'pending' },
    { label: 'System output schema defined', status: 'pending' },
    { label: 'All blocks are connected', status: 'pending' },
    { label: 'Block schema validation', status: 'pending' },
    { label: 'All flows mapped', status: 'pending' },
    { label: 'Flow schema validation', status: 'pending' },
    { label: 'No circular dependency', status: 'pending' },
    { label: 'Template selected', status: 'pending' },
    { label: 'Nodes in block are configured', status: 'pending' },
    { label: 'All nodes in flow are configured', status: 'pending' },
  ]);

  // Logic: Deploy is enabled only if all statuses are 'success'
  canDeploy = computed(() =>
    this.validationSteps().every(step => step.status === 'success')
  );

  runTest(index: number) {
    this.updateStatus(index, 'loading');

    // Simulate async validation logic
    setTimeout(() => {
      this.updateStatus(index, 'success');
    }, 600);
  }

  runFullValidation() {
    this.validationSteps().forEach((step, i) => {
      if (step.status !== 'success') {
        setTimeout(() => this.runTest(i), i * 150);
      }
    });
  }

  private updateStatus(index: number, status: 'pending' | 'success' | 'loading') {
    this.validationSteps.update(steps => {
      const newSteps = [...steps];
      newSteps[index] = { ...newSteps[index], status };
      return newSteps;
    });
  }
}
