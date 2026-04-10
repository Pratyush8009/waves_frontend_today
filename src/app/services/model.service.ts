import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Base Interfaces for the Flow Data ---

export interface FlowNodePosition {
  x: number;
  y: number;
}

export interface FlowNode {
  id: string;
  name: string;
  type: string;
  position: FlowNodePosition;
  source: boolean;
  target: boolean;
}

export interface FlowConnection {
  sourceId: string;
  targetId: string;
}

export interface ModelFlow {
  flowId: string;
  name: string;
  description: string;
  systemId: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
}

export interface ModelDetails {
  modelId: string;
  version: string;
  status: string;
  createdAt: string;
  commit: string;
  modelFlow: ModelFlow;
}

// --- API Request / Response Interfaces ---

export interface ModelDetailsRequest {
  modelId: string;
  modelVersion: string;
}

export interface BaseApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
  meta: any;
  requestId: string;
  timestamp: string;
}

// Concrete response type leveraging the Base Envelope
export type GetModelDetailsResponse = BaseApiResponse<ModelDetails>;

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  // Base URL pointing at your API gateway
  private apiUrl = 'http://localhost:8080/api/v1/user/units/systems';

  constructor(private http: HttpClient) { }


  getModelDetails(systemId: string, requestBody: ModelDetailsRequest): Observable<GetModelDetailsResponse> {
    const url = `${this.apiUrl}/${systemId}/model/`;
    return this.http.post<GetModelDetailsResponse>(url, requestBody);
  }
}