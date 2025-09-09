import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private _isExpanded = signal(true);
  
  get isExpanded() {
    return this._isExpanded.asReadonly();
  }

  toggle() {
    this._isExpanded.set(!this._isExpanded());
  }

  expand() {
    this._isExpanded.set(true);
  }

  collapse() {
    this._isExpanded.set(false);
  }
}
