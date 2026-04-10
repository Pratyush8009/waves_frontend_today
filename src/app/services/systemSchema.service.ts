import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemSchemaField {
  _id?: string;
  fieldName: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'float' | 'object' | 'array' | 'null';
  system_id: string;
  type: 'input' | 'output';
  is_required:boolean;
  default_value?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSchemaFieldRequest {
  fieldName: string;
  dataType: string;
  system_id: string;
  type: 'input' | 'output';
  is_required: boolean;
  default_value?: any;
  description?: string;
  validation_rules?: any;
  order?: number;
}

export interface CreateSchemaFieldResponse {
  message: string;
  success: boolean;
  data: SystemSchemaField;
}

export interface GetSchemaFieldsResponse {
  message: string;
  success: boolean;
  data: SystemSchemaField[];
}

export interface GetSchemaFieldResponse {
  message: string;
  success: boolean;
  data: SystemSchemaField;
}



@Injectable({
  providedIn: 'root'
})
export class SystemSchemaService {
  private apiUrl = 'http://localhost:5000/api/system-schema';

  constructor(private http: HttpClient) {}

  createSchemaField(fieldData: CreateSchemaFieldRequest): Observable<CreateSchemaFieldResponse> {
    return this.http.post<CreateSchemaFieldResponse>(`${this.apiUrl}/create`, fieldData);
  }

  getSystemSchemaFields(systemId: string): Observable<GetSchemaFieldsResponse> {
    let url = `${this.apiUrl}/system/${systemId}`;
    return this.http.get<GetSchemaFieldsResponse>(url);
  }

  getSchemaFieldById(fieldId: string): Observable<GetSchemaFieldResponse> {
    return this.http.get<GetSchemaFieldResponse>(`${this.apiUrl}/${fieldId}`);
  }

  updateSchemaField(fieldId: string, updateData: Partial<SystemSchemaField>): Observable<CreateSchemaFieldResponse> {
    return this.http.put<CreateSchemaFieldResponse>(`${this.apiUrl}/${fieldId}`, updateData);
  }

  deleteSchemaField(fieldId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${fieldId}`);
  }



}