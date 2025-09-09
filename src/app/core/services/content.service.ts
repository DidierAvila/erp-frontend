import { Injectable, signal, Type } from '@angular/core';

export interface ContentItem {
  component: Type<any>;
  title: string;
  icon?: string;
  menuId?: string; // Identificador único del menú activo
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private currentContent = signal<ContentItem | null>(null);
  private activeMenuItem = signal<string | null>(null);

  get currentContent$() {
    return this.currentContent.asReadonly();
  }

  get activeMenuItem$() {
    return this.activeMenuItem.asReadonly();
  }

  setContent(content: ContentItem): void {
    this.currentContent.set(content);
    if (content.menuId) {
      this.activeMenuItem.set(content.menuId);
    }
  }

  clearContent(): void {
    this.currentContent.set(null);
    this.activeMenuItem.set(null);
  }

  setActiveMenuItem(menuId: string): void {
    this.activeMenuItem.set(menuId);
  }
}
