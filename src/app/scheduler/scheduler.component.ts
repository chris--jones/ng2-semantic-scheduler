import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
const ComponentStyle = require('!raw-loader!less-loader!./scheduler.component.less');

export class ScheduledEvent {
  startDate: Date;
  endDate: Date;
  title: string;
  colour?: string;
}

export class DayOfWeek {
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
export class SchedulerComponent implements OnInit {
  // params
  @Input()
  events: ScheduledEvent[];
  @Input()
  startDate: Date;
  startHour: number;
  endHour: number;
  showAllDay: boolean = true;
  defaultEventColour: string = 'blue';
  @Input()
  disabled: boolean = false;
  @Output()
  onSlotClick = new EventEmitter();
  // private members
  hours: number[] = [6,7,8,9,10,11,12,13,14,15,16,17,18];
  days: DayOfWeek[] = [];
  eventsLookup: any = {};
  dragEvent: ScheduledEvent;
  dragDate: Date;

  ngOnInit() {
    if (!this.startDate) this.startDate = new Date();
    else if (typeof(this.startDate)==='string') this.startDate = new Date(this.startDate);
    let dayDate = new Date(this.startDate.getTime());
    for(let i=0;i<7;i++) {
      if (i>0) dayDate.setDate(dayDate.getDate()+1);
      let day = DaysOfWeek[dayDate.getDay()],
      date = dayDate.getDate(),
      prefix = DayPrefix(date);
      this.days.push({number:date, label:`${day} ${date}${prefix}`});
    }
    this.events.forEach(event => {
      let key = event.startDate.getDate()+'_'+event.startDate.getHours(),
      duration = (event.endDate.getTime() - event.startDate.getTime())/1000/60/60,
      height = duration*2*100+Math.pow(duration*2, 2.5)+'%',
      entry = Object.assign({}, event, {duration, height});
      if (!this.eventsLookup[key]) this.eventsLookup[key] = [entry];
      else this.eventsLookup[key].push(entry);
    });
  }

  getSlotDate(date:number, time:number) {
    let slotDate = new Date(this.startDate.getTime());
    slotDate.setDate(date);
    slotDate.setHours(Math.floor(time), time%1*60);
    return slotDate;
  }

  slotClick(date:number, time:number) {
    let slotDate = this.getSlotDate(date, time);
    console.log("Slot Click", slotDate);
  }

  eventClick(event:any, scheduledEvent:ScheduledEvent) {
    event.stopPropagation();
    console.log("Event Click", scheduledEvent);
  }

  eventDragStart(event:any, scheduledEvent:ScheduledEvent) {
    event.stopPropagation();
    this.dragEvent = scheduledEvent;
    console.log("Drag Start", scheduledEvent);
  }

  eventDragEnd(event:any, scheduledEvent:ScheduledEvent) {
    event.stopPropagation();
    this.dragEvent = null;
    console.log("Drag End", scheduledEvent, this.dragDate);
  }

  eventDrop(event: any) {
    console.log("Event Drop", this.dragEvent, this.dragDate);
  }

  allowDrop(event: any, date:number, time:number) {
    event.preventDefault();
    let slotDate = this.getSlotDate(date, time);
    this.dragDate = slotDate;
    return false;
  }
}
