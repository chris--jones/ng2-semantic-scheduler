import { Component, Input, Output, OnInit, OnChanges, SimpleChange, EventEmitter } from '@angular/core';
const ComponentStyle = require('!raw-loader!less-loader!./scheduler.component.less');

export interface ScheduledEvent {
  title: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
  colour?: string;
  [x: string]: any;
}

class DayOfWeek {
  number: number;
  label: string;
}

const DaysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DayPrefix = (day:number) => {
  if (day%10==1) return "st";
  if (day%10==2) return "nd";
  if (day%10==3) return "rd";
  return "th";
}

@Component({
  selector: 'sui-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: [ ComponentStyle ]
})
export class SchedulerComponent implements OnInit, OnChanges {
  // params
  @Input() events: ScheduledEvent[];
  @Input() startDate: Date;
  @Input() startHour: number = 6;
  @Input() endHour: number = 18;
  @Input() showAllDay: boolean = true;
  @Input() defaultEventColour: string = 'blue';
  @Input() allowDropFunction: (event:ScheduledEvent, date:number, hour:number, fullDate:Date) => boolean;
  @Input() disabled: boolean = false;
  @Output() onSlotClick = new EventEmitter();
  @Output() onSlotDoubleClick = new EventEmitter();
  @Output() onEventClick = new EventEmitter();
  @Output() onEventRemove = new EventEmitter();
  @Output() onEventDragStart = new EventEmitter();
  @Output() onEventDragHover = new EventEmitter();
  @Output() onEventDragEnd = new EventEmitter();
  // private members
  private hours: number[] = [];
  private days: DayOfWeek[] = [];
  private cellHeight:number;
  private eventsLookup: any = {};
  private dragEvent: ScheduledEvent;
  private dragDate: Date;
  private removeButtons: boolean = true;

  ngOnInit() {
    if (!this.startDate) this.startDate = new Date();
    else if (typeof(this.startDate)==='string') this.startDate = new Date(this.startDate);
    for(let i=this.startHour;i<=this.endHour;i++){
      this.hours.push(i);
    }
    let dayDate = new Date(this.startDate.getTime());
    for(let i=0;i<7;i++) {
      if (i>0) dayDate.setDate(dayDate.getDate()+1);
      let day = DaysOfWeek[dayDate.getDay()],
      date = dayDate.getDate(),
      prefix = DayPrefix(date);
      this.days.push({number:date, label:`${day} ${date}${prefix}`});
    }
  }

  ngOnChanges(changes:{[x:string]: SimpleChange}) {
    if (changes['events']) {
      this.eventsLookup = {};
      this.events.forEach(event => {
        let key = event.startDate.getDate() + '_' + (event.allDay ? 'allday' : event.startDate.getHours()),
        duration = event.allDay ? 0 : (event.endDate.getTime()-event.startDate.getTime())/1000/60/60,
        entry = Object.assign({}, event, {duration});
        if (!this.eventsLookup[key]) this.eventsLookup[key] = [entry];
        else this.eventsLookup[key].push(entry);
      });
    }
  }

  getCellHeight(tr: any) {
    if (!this.cellHeight) setTimeout(()=>this.cellHeight = tr.getBoundingClientRect().height, 0);
    return this.cellHeight;
  }

  getSlotDate(date:number, hour?:number) {
    let slotDate = new Date(this.startDate.getTime());
    slotDate.setDate(date);
    if (typeof(hour)!=='undefined') slotDate.setHours(Math.floor(hour), hour%1*60);
    return slotDate;
  }

  slotClick(date:number, hour?:number) {
    let fullDate = this.getSlotDate(date, hour);
    this.onSlotClick.emit({date,hour,fullDate, originalEvent:event});
  }

  slotDoubleClick(date:number, hour?:number) {
    let fullDate = this.getSlotDate(date, hour);
    this.onSlotDoubleClick.emit({date,hour,fullDate, originalEvent:event});
  }

  eventClick(event:any, scheduledEvent:ScheduledEvent) {
    event.stopPropagation();
    this.onEventClick.emit({event: scheduledEvent, originalEvent:event});
  }

  eventRemoveClick(event:any, scheduledEvent:ScheduledEvent) {
    event.stopPropagation();
    this.onEventRemove.emit({event: scheduledEvent, originalEvent:event});
  }

  eventDragStart(event:any, scheduledEvent:ScheduledEvent) {
    this.dragEvent = scheduledEvent;
    this.onEventDragStart.emit({event: scheduledEvent, originalEvent:event});
  }

  eventDrop(event: any, date:number, hour?:number) {
    event.preventDefault();
    let fullDate = this.getSlotDate(date, hour);
    this.dragDate = fullDate;
    this.onEventDragEnd.emit({event: this.dragEvent, date, hour, fullDate, originalEvent:event});
    this.dragEvent = null;
  }

  allowDrop(event: any, date:number, hour?:number) {
    // TODO: don't call this on every drag, only when date/hour change
    let fullDate = this.getSlotDate(date, hour);
    if (!this.allowDropFunction || this.allowDropFunction(this.dragEvent, date, hour, fullDate)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
}
