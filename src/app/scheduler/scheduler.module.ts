import { SchedulerComponent } from './scheduler.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: [SchedulerComponent],
  declarations: [SchedulerComponent],
})
export class SchedulerModule { }
