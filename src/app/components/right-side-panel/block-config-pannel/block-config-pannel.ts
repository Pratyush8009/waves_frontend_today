import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';


@Component({
  selector: 'app-block-config-pannel',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './block-config-pannel.html',
  styleUrls: ['./block-config-pannel.css']
})
export class BlockConfigPannel {

  @Input() selectedNode: any;

}