import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  EventEmitter, Output
} from '@angular/core';
import { ChangeDetectorRef } from '@angular/core'; // 1. Add this import
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
import { HostListener } from '@angular/core';
import { FlowConfigPanel } from '../../components/right-side-panel/flow-config-panel/flow-config-panel';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

interface NodeModel {
  id: string;
  name: string;
  type: string;
  schema?: any[],
  config?: any[],
  parentSchemas?: any[],
  childSchemas?: any[]
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
  selector: 'app-flow-editor',
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzBreadCrumbModule,
    NzSplitterModule,
    NzIconModule,
    NzTooltipModule,
    Logs,
    FlowConfigPanel,
    NzDividerModule,
    NzModalModule,
    NzSelectModule,
    NzCollapseModule
  ],
  templateUrl: './flow-editor.html',
  styleUrl: './flow-editor.css',
})

export class FlowEditor implements AfterViewInit, OnInit {
  @Output() fullscreenChange = new EventEmitter<boolean>();
  @ViewChild('container') container!: ElementRef;

  // node variables
  instance!: BrowserJsPlumbInstance;
  selectedNode: NodeModel | null = null;
  systemId!: string;
  logs: FlowLog[] = [];
  isFullscreen: any;
  is_log: boolean = false
  showFlow: any

  // flow varibales
  isFlowModalVisible = false;
  currentEditingFlow: SavedFlow | null = null;
  flowForm = {
    flowId: '',
    name: '',
    description: ''
  };

  // Context Menu varibales
  isContextMenuVisible = false;
  contextMenuPosition = { x: 0, y: 0 };
  contextMenuNode: NodeModel | null = null;



  blocks = [
    { label: 'Block-1', value: 'block-1' },
    { label: 'Block-2', value: 'block-2' },
    { label: 'Block-3', value: 'block-3' }
  ];

  block = {
    name: "Block-1"
  }

  onVersionChange(version: string): void {
    console.log('Selected version:', version);

  }
  panels = [
    {
      active: true,
      name: 'I/O Nodes',
      nodes: [
        { id: 'input', name: 'Input', type: "input", schema: [], position: { x: 0, y: 0 }, source: true, target: false },
        { id: 'output', name: 'Output', type: "output", schema: [], position: { x: 0, y: 0 }, source: false, target: true }
      ],
    },
    {
      active: false,
      name: 'Processing Nodes',
      nodes: [
        { id: '75974394556', name: 'Filter', type: "processing", position: { x: 0, y: 0 }, source: true, target: true },
        { id: '58769857567', name: 'Function', type: "processing", position: { x: 0, y: 0 }, source: true, target: true },
        { id: '58769857567', name: 'Processing', type: "processing", position: { x: 0, y: 0 }, source: true, target: true },
      ]
    },
    {
      active: false,
      name: 'ML Nodes',
      nodes: [
        { id: '75974394556', name: 'CNN', type: "model", position: { x: 0, y: 0 }, source: true, target: true },
        { id: '58769857567', name: 'RNN', type: "model", position: { x: 0, y: 0 }, source: true, target: true },
        { id: '58769857568', name: 'LSTM', type: "model", position: { x: 0, y: 0 }, source: true, target: true },
        { id: '58769857569', name: 'GANs', type: "model", position: { x: 0, y: 0 }, source: true, target: true },

      ]
    }
  ];
  
  //==========MOCK DATA===========//

  saveFlows: SavedFlow[] = [

    { "flowId": "flow-1771933423464", "name": "Flow-1", "description": "", "systemId": "69956cf2e5d337971f524332", "nodes": [{ "id": "input-1772091727033", "name": "Input", "type": "input", "schema": [], "position": { "x": 105, "y": 156 }, "source": true, "target": false }, { "id": "output-1772091729043", "name": "Output", "type": "output", "schema": [], "position": { "x": 567, "y": 104 }, "source": false, "target": true }, { "id": "75974394556-1772091733704", "name": "Filter", "type": "processing", "position": { "x": 280, "y": 338 }, "source": true, "target": true }, { "id": "75974394556-1772092438021", "name": "CNN", "type": "model", "position": { "x": 341, "y": 152 }, "source": true, "target": true }], "connections": [{ "sourceId": "input-1772091727033", "targetId": "75974394556-1772091733704" }, { "sourceId": "75974394556-1772091733704", "targetId": "75974394556-1772092438021" }, { "sourceId": "75974394556-1772092438021", "targetId": "output-1772091729043" }] },
    { "flowId": "flow-1772092497052", "name": "Flow-2", "description": "", "systemId": "69956cf2e5d337971f524332", "nodes": [{ "id": "input-1772092529884", "name": "Input", "type": "input", "schema": [], "position": { "x": 84, "y": 117 }, "source": true, "target": false }, { "id": "58769857567-1772092534405", "name": "Function", "type": "processing", "position": { "x": 319, "y": 190 }, "source": true, "target": true }, { "id": "75974394556-1772092542543", "name": "Filter", "type": "processing", "position": { "x": 243, "y": 78 }, "source": true, "target": true }, { "id": "58769857567-1772092554966", "name": "RNN", "type": "model", "position": { "x": 489, "y": 111 }, "source": true, "target": true }, { "id": "output-1772092579455", "name": "Output", "type": "output", "schema": [], "position": { "x": 712, "y": 133 }, "source": false, "target": true }], "connections": [{ "sourceId": "input-1772092529884", "targetId": "75974394556-1772092542543" }, { "sourceId": "75974394556-1772092542543", "targetId": "58769857567-1772092534405" }, { "sourceId": "58769857567-1772092534405", "targetId": "58769857567-1772092554966" }, { "sourceId": "58769857567-1772092554966", "targetId": "output-1772092579455" }] }
  ]



  flowNodes: NodeModel[] = [];
  draggedNode: NodeModel | null = null;
  draggedFlow: SavedFlow | null = null;

  constructor(private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.systemId = params.get('id')!;
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
  }

  // ================= DRAG FROM LIBRARY =================

  onDragStart(event: DragEvent, node: NodeModel) {

    this.draggedNode = node;
    event.dataTransfer?.setData('text/plain', node.id); // required
  }



  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    if (!this.currentEditingFlow) {
      alert('Please create or select a flow first.');
      return;
    }
    event.preventDefault();
    if (!this.draggedNode) return;

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
    this.instance.setDraggable(el, true);
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

  //====================CONTEXT MENU METHODS===================//

  openContextMenu(event: MouseEvent, node: NodeModel) {
    event.preventDefault(); // disable browser menu

    this.contextMenuNode = node;
    this.contextMenuPosition = {
      x: event.clientX,
      y: event.clientY
    };

    this.isContextMenuVisible = true;
  }

  // Close menu on outside click
  @HostListener('document:click')
  closeContextMenu() {
    this.isContextMenuVisible = false;
  }

  deleteNode() {
    if (!this.contextMenuNode) return;

    const el = document.getElementById(this.contextMenuNode.id);

    if (el) {
      this.instance.removeAllEndpoints(el);  // ✅ pass element
      this.instance.unmanage(el);
    }

    this.flowNodes = this.flowNodes.filter(
      n => n.id !== this.contextMenuNode!.id
    );

    this.isContextMenuVisible = false;
  }

  renameNode() {
    if (!this.contextMenuNode) return;

    const newName = prompt('Enter new name:', this.contextMenuNode.name);
    if (newName) {
      this.contextMenuNode.name = newName;
    }

    this.isContextMenuVisible = false;
  }

  viewDetails() {
    if (!this.contextMenuNode) return;

    this.open(this.contextMenuNode);   // ✅ correct

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

    setTimeout(() => {
      this.setupNode(newNode);
    });

    this.isContextMenuVisible = false;
  }







  // =============FLOW MANAGEMENT RELATED METHODS=============//

  loadSavedFlow(flow: SavedFlow) {
    this.currentEditingFlow = flow;
    this.clearCanvas();
    this.flowNodes = JSON.parse(JSON.stringify(flow.nodes));
    this.cdr.detectChanges();
    this.flowNodes.forEach(node => {
      this.setupNode(node);
    });
    setTimeout(() => {
      flow.connections.forEach(conn => {
        const sourceEl = document.getElementById(conn.sourceId);
        const targetEl = document.getElementById(conn.targetId);

        if (sourceEl && targetEl) {
          this.instance.connect({
            source: sourceEl,
            target: targetEl,
            anchors: ['Right', 'Left'],
            connector: 'Bezier',
            paintStyle: { stroke: '#4a4a4a', strokeWidth: 2 },
            endpoint: { type: 'Dot', options: { radius: 5 } },
            endpointStyle: { fill: '#4a4a4a' }
          });
        }
      });
    }, 100);
  }

  saveFlow() {
    if (!this.flowForm.name) return;

    const newFlow: SavedFlow = {
      flowId: this.flowForm.flowId,
      name: this.flowForm.name,
      description: this.flowForm.description,
      systemId: this.systemId,
      nodes: [],
      connections: []
    };

    this.saveFlows.push(newFlow);
    this.currentEditingFlow = newFlow;

    this.isFlowModalVisible = false;
    this.clearCanvas();

  }

  closeFlowModal() {
    this.isFlowModalVisible = false;

  }

  openCreateFlowModal() {

    this.flowForm = {
      flowId: 'flow-' + Date.now(), // Auto ID
      name: '',
      description: ''
    };

    this.isFlowModalVisible = true;
  }

  deleteFlow(flowId: string) {
    this.saveFlows = this.saveFlows.filter(f => f.flowId !== flowId);

    if (this.currentEditingFlow?.flowId === flowId) {
      this.clearCanvas();
    }
  }

  saveCurrentFlow() {
    if (!this.currentEditingFlow) {
      alert('Please create or select a flow first.');
      return;
    }

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

    // ✅ Get latest node positions
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


    // ✅ Save
    this.currentEditingFlow.nodes = nodesWithCurrentPositions;
    this.currentEditingFlow.connections = latestConnections;

    alert('Flow saved successfully!');
    console.log("SAVED FLOW IS :", this.currentEditingFlow);
    this.showFlow = JSON.stringify(this.currentEditingFlow);
  }





  //================COMMON  METHODS===============//
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
