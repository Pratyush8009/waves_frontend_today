// services/subsystem.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subsystem {
  _id?: string;
  subsystem_name: string;
  system_id: string;
  description: string;
  is_configured: boolean;
  flowcount: number;
  is_top: boolean;
  is_bottom: boolean;
  position: {
    x: number;
    y: number;
  };
  source: boolean;
  target: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubsystemDto {
  subsystem_name: string;
  description: string;
  is_top: boolean;
  is_bottom: boolean;
  system_id: string;
}

export interface UpdateSubsystemDto {
  subsystem_name?: string;
  description?: string;
  is_top?: boolean;
  is_bottom?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SubsystemService {
  private apiUrl = 'http://localhost:5000/api/subsystem';

  constructor(private http: HttpClient) {}

  // Create a new subsystem
  createSubsystem(data: CreateSubsystemDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  // Get all subsystems by system ID
  getSubsystemsBySystemId(systemId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/system/${systemId}`);
  }

  // Get single subsystem by ID
  getSubsystemById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Update subsystem
  updateSubsystem(id: string, data: UpdateSubsystemDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // Delete subsystem
  deleteSubsystem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}