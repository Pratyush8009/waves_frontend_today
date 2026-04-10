import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// NG-ZORRO
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';

// Components
import { ModelBlockDetails } from '../../components/model-details/model-configuration/model-block-details/model-block-details';
import { SystemSchema } from '../../components/model-details/model-configuration/system-schema/system-schema';
import { ConfigurePage } from '../configure-page/configure-page';
import { FlowEditor } from '../flow-editor/flow-editor';
import { ModelSummary } from '../../components/model-details/model-configuration/model-summary/model-summary';
import { Deploy } from '../../components/deploy/deploy';
import { ModelOverview } from '../../components/model-details/model-overview/model-overview';
// Services & Interfaces
import { SystemService } from '../../services/system.service';

@Component({
  selector: 'app-system-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTabsModule,
    NzButtonModule,
    NzIconModule,
    NzBreadCrumbModule,
    NzTooltipModule,
    ModelBlockDetails,
    ConfigurePage,
    SystemSchema,
    FlowEditor,
    NzPageHeaderModule,
    ModelSummary,
    NzDividerModule,
    Deploy,
    ModelOverview
  ],
  templateUrl: './model-page.html',
  styleUrl: './model-page.css',
})
export class ModelPage implements OnInit {
  systemId!: string;
  userId!: any;
  selectedTabIndex = 0;
  isFullScreen = false;
  isConfigFullscreen = false;
  isFlowMode = false;
  unitId!: string;

  // New states to hold the API extracted data
  system: any | null = null;
  extractedModelId: string = '';
  selectedVersion: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private systemService: SystemService,
    private message: NzMessageService
  ) {
    this.userId = localStorage.getItem("currentUserId");
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.unitId = params.get('id') || '';
      this.systemId = params.get('systemId') || '';

      if (this.unitId && this.systemId) {
        this.loadSystemDetails();
      }
    });
  }

  loadSystemDetails() {

  }

  handleVersionSelection(version: string) {
    this.selectedVersion = version;
    this.selectedTabIndex = 1;
  }



  onFullscreenChange(isFullscreen: boolean) {
    this.isFullScreen = isFullscreen;
  }

  setActiveTab(index: number) {
    this.selectedTabIndex = index;
  }

  toggleEditor() {
    this.isFlowMode = !this.isFlowMode;
  }
}