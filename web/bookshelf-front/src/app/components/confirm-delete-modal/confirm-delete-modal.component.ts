import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-delete-modal.component.html',
  styleUrls: ['./confirm-delete-modal.component.css']
})
export class ConfirmDeleteModalComponent {
  @Input() isVisible = false;
  @Input() itemTitle = '';
  @Input() itemType = '';
  @Input() isDeleting = false;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    if (!this.isDeleting) {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    if (!this.isDeleting) {
      this.cancel.emit();
    }
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget && !this.isDeleting) {
      this.cancel.emit();
    }
  }
}