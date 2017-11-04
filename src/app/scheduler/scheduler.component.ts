import { Component, Input, Output, OnInit, OnChanges, SimpleChange, EventEmitter } from '@angular/core';
const ComponentStyle = require('!raw-loader!less-loader!./scheduler.component.less');

export interface SchedulerItem {
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

export const DaysOfWeek:string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
  @Input() items: SchedulerItem[];
  @Input() startDate: Date;
  @Input() startHour: number = 6;
  @Input() endHour: number = 18;
  @Input() days: number[] = [0,1,2,3,4,5,6];
  @Input() showAllDay: boolean = true;
  @Input() defaultItemColour: string = 'blue';
  @Input() allowDrop: (item:SchedulerItem, date:number, hour:number, fullDate:Date) => boolean;
  @Input() disabled: boolean = false;
  @Input() removeButtons: boolean = true;
  @Output() onSlotClick = new EventEmitter();
  @Output() onSlotDoubleClick = new EventEmitter();
  @Output() onSlotHover = new EventEmitter();
  @Output() onItemClick = new EventEmitter();
  @Output() onItemRemove = new EventEmitter();
  @Output() onItemDragStart = new EventEmitter();
  @Output() onItemDragHover = new EventEmitter();
  @Output() onItemDragEnd = new EventEmitter();
  // private members
  private hours: number[] = [];
  private daysOfWeek: DayOfWeek[] = [];
  private itemLookup: any = {};
  private drag: any;
  private resizeHandles: boolean = true;
  private lastAllowDrop:{date:number, hour?:number, allowed:boolean};
  private cellHeight: number = 22;
  private slotHoverTimeout: any;
  private slotHoverTimeoutSeconds: number = 300;

  ngOnInit() {
    if (this.startHour < 0) this.startHour = 0;
    if (this.endHour > 23) this.endHour = 23;
    for(let hour=this.startHour;hour<=this.endHour;hour++) this.hours.push(hour);
  }

  ngOnChanges(changes:{[x:string]: SimpleChange}) {
    if (changes['items']) {
      this.itemLookup = {};
      this.items.forEach(item => {
        let key = item.startDate.getDate() + '_' + (item.allDay ? 'allday' : item.startDate.getHours()),
        duration = item.allDay ? 0 : (item.endDate.getTime()-item.startDate.getTime())/1000/60/60,
        entry = Object.assign({}, item, {duration});
        if (!this.itemLookup[key]) this.itemLookup[key] = [entry];
        else this.itemLookup[key].push(entry);
      });
    }
    if (changes['days']) {
      if (!this.startDate) this.startDate = new Date();
      else if (typeof(this.startDate)==='string') this.startDate = new Date(this.startDate);
      this.days.sort();
      this.daysOfWeek = [];
      this.days.forEach(d => {
        let dayDate = new Date(this.startDate.getTime());
        dayDate.setDate(dayDate.getDate()+d);
        let day = DaysOfWeek[dayDate.getDay()],
        date = dayDate.getDate(),
        prefix = DayPrefix(date);
        this.daysOfWeek.push({number:date, label:`${day} ${date}${prefix}`});
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

  slotClick(event:any, date:number, hour?:number) {
    let fullDate = this.getSlotDate(date, hour);
    this.onSlotClick.emit({date,hour,fullDate,originalEvent:event});
  }

  slotDoubleClick(event:any, date:number, hour?:number) {
    let fullDate = this.getSlotDate(date, hour);
    this.onSlotDoubleClick.emit({date,hour,fullDate,originalEvent:event});
  }

  slotHoverStart(event:any, date:number, hour?:number) {
    this.slotHoverTimeout = setTimeout(()=>{
      let fullDate = this.getSlotDate(date, hour);
      this.onSlotHover.emit({date,hour,fullDate,originalEvent:event});
    }, this.slotHoverTimeoutSeconds);
  }

  slotHoverEnd(event:any, date:number, hour?:number) {
    clearTimeout(this.slotHoverTimeout);
  }

  itemClick(event:any, item:SchedulerItem) {
    event.stopPropagation();
    this.onItemClick.emit({item, event});
  }

  itemRemoveClick(event:any, item:SchedulerItem) {
    event.stopPropagation();
    this.onItemRemove.emit({item, event});
  }

  itemDragStart(event:any, item:SchedulerItem) {
    event.dataTransfer.setData('minuteOffset', this.getSlotMinuteOffset(event.offsetY));
    this.drag = { item };
    this.onItemDragStart.emit({item, event});
  }

  itemResizeStart(event:any, from:'top'|'bottom', item:SchedulerItem) {
    this.drag = { type:'resize', from, item };
  }

  itemDrop(event: any, date:number, hour?:number) {
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
    this.onItemDragEnd.emit({item: this.drag.item, date, hour, fullDate, allDay, event});
    this.drag = null;
  }

  itemDragOver(event: any, date:number, hour?:number) {
    let lastAllowDrop = (this.lastAllowDrop && this.lastAllowDrop.date === date && this.lastAllowDrop.hour === hour),
    fullDate = this.getSlotDate(date, hour);
    if (lastAllowDrop ? this.lastAllowDrop.allowed : (!this.allowDrop || this.allowDrop(this.drag.item, date, hour, fullDate))) {
      event.preventDefault();
      if (!lastAllowDrop) this.lastAllowDrop = {date,hour,allowed:true};
      return false;
    } else {
      if (!lastAllowDrop) this.lastAllowDrop = {date,hour,allowed:false};
      return true;
    }
  }
}
