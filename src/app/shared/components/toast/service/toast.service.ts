import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'danger' | 'info';

export interface Toast { type: ToastType; message: string; timeout?: number; }

interface ToastCfg { bg: string; icon: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private cfgs: Record<ToastType, ToastCfg> = {
    success: { bg: '#1D9E75', icon: '✓' },
    error:   { bg: '#E24B4A', icon: '✕' },
    warning: { bg: '#EF9F27', icon: '⚠' },
    info:    { bg: '#378ADD', icon: 'ℹ' },
    danger:  { bg: '#A32D2D', icon: '!' },
  };
  private list: Toast[] = [];

  show(type: ToastType, message: string, timeout = 5000): void {
    const t: Toast = { type, message, timeout };
    this.list.push(t);
    if (timeout > 0) { setTimeout(() => this.remove(t), timeout); }
  }
  remove(t: Toast): void { this.list = this.list.filter(x => x !== t); }
  getToasts(): Toast[]   { return this.list; }
  getCfg(type: ToastType): ToastCfg { return this.cfgs[type] ?? this.cfgs['info']; }
}
