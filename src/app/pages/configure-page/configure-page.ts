import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  Input, OnChanges, SimpleChanges,
  EventEmitter, Output
} from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { newInstance, BrowserJsPlumbInstance, Connection } from '@jsplumb/browser-ui';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { Logs, FlowLog } from '../../components/logs/logs';
import { BlockConfigPannel } from '../../components/right-side-panel/block-config-pannel/block-config-pannel';
import { HostListener } from '@angular/core';

// Import BOTH services
import { SystemService } from '../../services/system.service';
import { ModelService, ModelDetailsRequest } from '../../services/model.service';

interface NodeModel {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  source: boolean;
  target: boolean;
}

interface SavedFlow {
  flowId: string;
  systemId: string;
  name: string;
  description: string;
  nodes: NodeModel[];
  connections: {
    sourceId: string;
    targetId: string;
  }[];
}

@Component({
  selector: 'app-configure-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzBreadCrumbModule,
    NzSplitterModule,
    NzIconModule,
    NzTooltipModule,
    Logs,
    BlockConfigPannel,
    NzDividerModule,
    NzModalModule,
  ],
  templateUrl: './configure-page.html',
  styleUrl: './configure-page.css'
})
export class ConfigurePage implements AfterViewInit, OnInit, OnChanges {
  @Output() fullscreenChange = new EventEmitter<boolean>();
  @ViewChild('container') container!: ElementRef;
  @Input() version: string = '';
  @Input() modelId: string = '';

  // Node variables
  instance!: BrowserJsPlumbInstance;
  selectedNode: NodeModel | null = null;
  systemId!: string;
  unitId!: string;
  logs: FlowLog[] = [];
  isFullscreen: any;
  is_log: boolean = false;
  showFlow: any;

  // States to hold the API data locally
  system: any = null;
  loading: boolean = false;

  // Context Menu variables
  isContextMenuVisible = false;
  contextMenuPosition = { x: 0, y: 0 };
  contextMenuNode: NodeModel | null = null;

  // State Management Variables
  isEditMode = false;
  structuralChangeOccurred = false;
  originalNodeCount = 0;

  // Modal Variables
  isModalVisible = false;
  versionName = '';
  versionCommit = '';

  //==========MOCK DATA===========//
  systemNodes: NodeModel[] = [
    { id: 'input', name: 'Input', type: "input", position: { x: 0, y: 0 }, source: true, target: false },
    { id: 'output', name: 'Output', type: "output", position: { x: 0, y: 0 }, source: false, target: true }
  ];

  blockNodes: NodeModel[] = [
    { id: 'process', name: 'Custom Block', type: "block", position: { x: 0, y: 0 }, source: true, target: true },
  ];

  blockPalet: NodeModel[] = [
    { id: 'block-39874', name: 'Block-1', type: "block", position: { x: 0, y: 0 }, source: true, target: true },
    { id: 'block-39878', name: 'Block-2', type: "block", position: { x: 0, y: 0 }, source: true, target: true },
    { id: 'block-39873', name: 'Block-3', type: "block", position: { x: 0, y: 0 }, source: true, target: true },
    { id: 'block-39872', name: 'Block-4', type: "block", position: { x: 0, y: 0 }, source: true, target: true },
  ];
  savedBlocks: NodeModel[] = [];

  // Strongly typed to avoid 'never[]' assignment errors
  saveFlow: SavedFlow = {
    flowId: "",
    name: "",
    description: "",
    systemId: "",
    nodes: [],
    connections: []
  };

  flowNodes: NodeModel[] = [];
  draggedNode: NodeModel | null = null;
  draggedFlow: SavedFlow | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private systemService: SystemService,
    private modelService: ModelService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.unitId = params.get('id') || '';
      this.systemId = params.get('systemId') || '';
      console.log("Unit Id in configure page is :", this.unitId);
      console.log("System Id in configure page is :", this.systemId);

      if (this.unitId && this.systemId) {
        this.loadSystemDetails();
      }
    });
  }

  loadSystemDetails() {


  }

  loadModelCanvas() {
    this.loading = true; // Show loader during version shifts too

    const requestBody: ModelDetailsRequest = {
      modelId: this.modelId,
      modelVersion: this.version
    };

    console.log("📡 Fetching canvas flow with payload:", requestBody);

    this.modelService.getModelDetails(this.systemId, requestBody).subscribe({
      next: (response) => {
        console.log("✅ Model canvas flow retrieved successfully:", response.data.modelFlow);

        this.saveFlow = response.data.modelFlow;

        // Clear and redraw jsPlumb connections
        this.loadSavedFlow(this.saveFlow);
        this.originalNodeCount = this.saveFlow.nodes.length;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ Failed to fetch model flow canvas:', error);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initJsPlumb();
    });
  }

  private initJsPlumb() {
    this.instance = newInstance({
      container: this.container.nativeElement
    });

    this.instance.importDefaults({
      connector: 'Bezier',
      paintStyle: { stroke: '#4a4a4a', strokeWidth: 2 },
      endpoint: { type: 'Dot', options: { radius: 5 } },
      endpointStyle: { fill: '#4a4a4a' }
    });

    this.applyEditModeStyles();
  }

  // ================= EDIT MODE MANAGEMENT =================

  toggleEditSave() {
    if (!this.isEditMode) {
      this.isEditMode = true;
      this.originalNodeCount = this.flowNodes.length;
      this.structuralChangeOccurred = false;
      this.applyEditModeStyles();
    } else {
      this.checkAndSave();
    }
  }

  private applyEditModeStyles() {
    setTimeout(() => {
      this.flowNodes.forEach(node => {
        const el = document.getElementById(node.id);
        if (el) {
          this.instance.setDraggable(el, this.isEditMode);
        }
      });
    });
  }

  // ================= DRAG FROM LIBRARY =================

  onDragStart(event: DragEvent, node: NodeModel) {
    if (!this.isEditMode) return;
    this.draggedNode = node;
    event.dataTransfer?.setData('text/plain', node.id);
  }

  onDragOver(event: DragEvent) {
    if (!this.isEditMode) return;
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!this.isEditMode || !this.draggedNode) return;

    const rect = this.container.nativeElement.getBoundingClientRect();

    const newNode: NodeModel = {
      ...this.draggedNode,
      id: this.draggedNode.id + '-' + Date.now(),
      position: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    };

    this.flowNodes.push(newNode);
    this.structuralChangeOccurred = true;

    setTimeout(() => {
      this.setupNode(newNode);
    });

    this.draggedNode = null;
  }

  private setupNode(node: NodeModel) {
    const el = document.getElementById(node.id);

    if (!el) {
      console.warn(`Element with ID ${node.id} not found in DOM!`);
      return;
    }
    this.instance.manage(el);
    this.instance.setDraggable(el, this.isEditMode);

    if (node.source) {
      this.instance.addEndpoint(el, {
        endpoint: { type: 'Dot', options: { radius: 5 } },
        paintStyle: { fill: '#4a4a4a' },
        anchor: 'Right',
        source: true,
        maxConnections: -1,
        uuid: `${node.id}-right`
      });
    }
    if (node.target) {
      this.instance.addEndpoint(el, {
        endpoint: { type: 'Dot', options: { radius: 5 } },
        paintStyle: { fill: '#4a4a4a' },
        anchor: 'Left',
        target: true,
        maxConnections: -1,
        uuid: `${node.id}-left`
      });
    }
  }

  open(node: NodeModel) {
    this.selectedNode = node;
  }

  // =================== Version loading ==================== //
  ngOnChanges(changes: SimpleChanges) {
    if (changes['version'] && changes['version'].currentValue) {
      const prevVersion = changes['version'].previousValue;
      const currentVersion = changes['version'].currentValue;

      console.log(`🔄 Configuration page detected version change: ${prevVersion} -> ${currentVersion}`);

      this.version = currentVersion;

      // Hook: Call the service directly if we already have an established system load
      if (this.systemId && this.modelId) {
        this.loadModelCanvas();
      }
    }

    if (changes['modelId'] && changes['modelId'].currentValue) {
      console.log('✅ Configuration page received modelId from parent:', this.modelId);
    }
  }

  // ==================== CONTEXT MENU METHODS =================== //

  openContextMenu(event: MouseEvent, node: NodeModel) {
    if (!this.isEditMode) return;
    event.preventDefault();

    this.contextMenuNode = node;
    this.contextMenuPosition = {
      x: event.clientX,
      y: event.clientY
    };

    this.isContextMenuVisible = true;
  }

  @HostListener('document:click')
  closeContextMenu() {
    this.isContextMenuVisible = false;
  }

  deleteNode() {
    if (!this.contextMenuNode || !this.isEditMode) return;

    const el = document.getElementById(this.contextMenuNode.id);

    if (el) {
      this.instance.removeAllEndpoints(el);
      this.instance.unmanage(el);
    }

    this.flowNodes = this.flowNodes.filter(
      n => n.id !== this.contextMenuNode!.id
    );

    this.structuralChangeOccurred = true;
    this.isContextMenuVisible = false;
  }

  renameNode() {
    if (!this.contextMenuNode) return;

    const newName = prompt('Enter new name:', this.contextMenuNode.name);
    if (newName) {
      this.contextMenuNode.name = newName;
      this.structuralChangeOccurred = true;
    }

    this.isContextMenuVisible = false;
  }

  viewDetails() {
    if (!this.contextMenuNode) return;
    this.open(this.contextMenuNode);
    this.isContextMenuVisible = false;
  }

  duplicateNode() {
    if (!this.contextMenuNode) return;

    const original = this.contextMenuNode;

    const newNode: NodeModel = {
      ...JSON.parse(JSON.stringify(original)),
      id: Date.now().toString(),
      position: {
        x: original.position.x + 40,
        y: original.position.y + 40
      }
    };

    this.flowNodes.push(newNode);
    this.structuralChangeOccurred = true;

    setTimeout(() => {
      this.setupNode(newNode);
    });

    this.isContextMenuVisible = false;
  }

  createFlow() { }

  saveBlock() {
    if (!this.contextMenuNode) return;

    const original = this.contextMenuNode;

    const newNode: NodeModel = {
      ...JSON.parse(JSON.stringify(original)),
      id: Date.now().toString(),
      position: {
        x: original.position.x + 40,
        y: original.position.y + 40
      }
    };

    this.savedBlocks.push(newNode);
  }

  // ============= FLOW MANAGEMENT & SAVE LOGIC ============= //

  loadSavedFlow(flow: SavedFlow) {
    this.clearCanvas();
    this.flowNodes = JSON.parse(JSON.stringify(flow.nodes));
    this.cdr.detectChanges();

    setTimeout(() => {
      this.flowNodes.forEach(node => {
        this.setupNode(node);
      });

      setTimeout(() => {
        flow.connections.forEach(conn => {
          this.instance.connect({
            uuids: [
              `${conn.sourceId}-right`,
              `${conn.targetId}-left`
            ]
          });
        });
      }, 100);
    }, 0);
  }

  checkAndSave() {
    if (this.structuralChangeOccurred || this.flowNodes.length !== this.originalNodeCount) {
      this.isModalVisible = true;
    } else {
      this.executeSave(false);
    }
  }

  handleSaveVersion() {
    if (!this.versionName.trim()) {
      alert('Please enter a version name');
      return;
    }
    this.executeSave(true);
    this.isModalVisible = false;
  }

  handleCancel() {
    this.isModalVisible = false;
  }

  executeSave(isNewVersion: boolean) {
    const raw = this.instance.getConnections();
    let connectionsArray: Connection[];

    if (Array.isArray(raw)) {
      connectionsArray = raw;
    } else {
      connectionsArray = Object.values(raw);
    }

    const latestConnections = connectionsArray.map((conn: Connection) => ({
      sourceId: conn.sourceId as string,
      targetId: conn.targetId as string
    }));

    const nodesWithCurrentPositions = this.flowNodes.map(node => {
      const el = document.getElementById(node.id);
      return {
        ...node,
        position: {
          x: el ? el.offsetLeft : node.position.x,
          y: el ? el.offsetTop : node.position.y
        }
      };
    });

    this.saveFlow.nodes = nodesWithCurrentPositions;
    this.saveFlow.connections = latestConnections;

    if (isNewVersion) {
      alert(`New flow version saved successfully with commit: ${this.versionCommit}`);
      this.saveFlow.flowId = 'flow-' + Date.now();
    } else {
      alert('Flow layout saved successfully on the existing version!');
    }

    this.showFlow = JSON.stringify(this.saveFlow);

    this.isEditMode = false;
    this.structuralChangeOccurred = false;
    this.originalNodeCount = this.flowNodes.length;
    this.versionName = '';
    this.versionCommit = '';
    this.applyEditModeStyles();
  }

  // ================ COMMON METHODS =============== //
  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    this.fullscreenChange.emit(this.isFullscreen);
  }

  clearCanvas() {
    if (!this.instance) return;

    this.flowNodes.forEach(node => {
      const el = document.getElementById(node.id);
      if (el) this.instance.unmanage(el);
    });

    this.instance.deleteEveryConnection();
    this.flowNodes = [];
    this.selectedNode = null;
    this.cdr.detectChanges();
  }
}