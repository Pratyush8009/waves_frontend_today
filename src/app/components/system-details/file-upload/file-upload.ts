import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzUploadModule, NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    NzUploadModule,
    NzCardModule,
    NzIconModule,
    NzProgressModule,
    NzButtonModule
  ],
  templateUrl: './file-upload.html',
  styleUrls: ['./file-upload.css']
})
export class FileUpload {
  fileList: NzUploadFile[] = [];

  handleChange(info: NzUploadChangeParam): void {
    this.fileList = [...info.fileList];
  }

  removeFile(file: NzUploadFile): void {
    this.fileList = this.fileList.filter(f => f.uid !== file.uid);
  }

  handleCancel(): void {
    this.fileList = [];
  }
}