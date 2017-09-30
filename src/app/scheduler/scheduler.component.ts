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
  @Input() allowDrop: (event:ScheduledEvent, date:number, hour:number, fullDate:Date) => boolean;
  @Input() disabled: boolean = false;
  @Input() removeButtons: boolean = true;
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
  private eventsLookup: any = {};
  private dragEvent: ScheduledEvent;
  private resizeHandles: boolean = false;
  private lastAllowDrop:{date:number, hour?:number, allowed:boolean};
  private cellHeight: number = 22;

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

  getSlotDate(date:number, hour?:number) {
    let slotDate = new Date(this.startDate.getTime());
    slotDate.setDate(date);
    if (typeof(hour)!=='undefined') slotDate.setHours(Math.floor(hour), hour%1*60);
    return slotDate;
  }

  getSlotMinuteOffset = (offsetY: number) => Math.floor(offsetY/this.cellHeight)*30;

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
    event.dataTransfer.setData('minuteOffset', this.getSlotMinuteOffset(event.offsetY));
    this.dragEvent = scheduledEvent;
    this.onEventDragStart.emit({event: scheduledEvent, originalEvent:event});
  }

  eventDrop(event: any, date:number, hour?:number) {
    event.preventDefault();
    let fullDate = this.getSlotDate(date, hour),
    allDay = typeof(hour)==='undefined',
    minuteOffset = event.dataTransfer.getData('minuteOffset');
    if (event.target.nodeName !== 'TD') {
      let durationDrag = this.getSlotMinuteOffset(event.offsetY)-minuteOffset,
      hours = Math.floor(durationDrag/60),
      mins = durationDrag%60;
      if (fullDate.getHours()+hours+(fullDate.getMinutes()+mins)/60 > this.startHour)
      {
        fullDate.setHours(fullDate.getHours()+hours);
        fullDate.setMinutes(fullDate.getMinutes()+mins);
      }
    } else {
      let hours = Math.floor(minuteOffset/60),
      mins = minuteOffset%60;
      fullDate.setHours(fullDate.getHours()-hours);
      fullDate.setMinutes(fullDate.getMinutes()-mins);
    }
    this.onEventDragEnd.emit({event: this.dragEvent, date, hour, fullDate, allDay, originalEvent:event});
    this.dragEvent = null;
  }

  eventDragOver(event: any, date:number, hour?:number) {
    let lastAllowDrop = (this.lastAllowDrop && this.lastAllowDrop.date === date && this.lastAllowDrop.hour === hour),
    fullDate = this.getSlotDate(date, hour);
    if (lastAllowDrop ? this.lastAllowDrop.allowed : (!this.allowDrop || this.allowDrop(this.dragEvent, date, hour, fullDate))) {
      event.preventDefault();
      if (!lastAllowDrop) this.lastAllowDrop = {date,hour,allowed:true};
      return false;
    } else {
      if (!lastAllowDrop) this.lastAllowDrop = {date,hour,allowed:false};
      return true;
    }
  }
}
