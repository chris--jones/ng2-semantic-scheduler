import { Component, OnChanges, SimpleChanges } from '@angular/core';
import '../assets/css/styles.less';
import { DaysOfWeek, SchedulerItem } from './scheduler/scheduler.component';
const ComponentStyle = require('!raw-loader!less-loader!./app.component.less');

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ ComponentStyle ]
})

export class AppComponent {
  date: Date;
  items: SchedulerItem[];
  showAllDay: boolean = true;
  allowRemove: boolean = true;
  dropFunction: boolean = false;
  days: number[] = [0,1,2,3,4,5,6];
  selectedDays: number[] = this.days.slice();
  daysOfWeek: string[] = DaysOfWeek.slice();

  constructor(){
    if (!this.date) this.date = new Date();
    this.items = [
      {
        id: 1,
        title: "Gerard's Birthday",
        startDate : new Date(2019,10,27,8,0,0),
        endDate : new Date(2019,10,27,9,0,0),
        allDay: true,
        colour: 'red'
      },
      {
        id: 2,
        title: 'Lunch Date',
        startDate : new Date(2019,10,24,12,0,0),
        endDate : new Date(2019,10,24,13,30,0),
        colour: 'orange'
      },
      {
        id: 3,
        title: 'Appointment',
        startDate : new Date(2019,10,26,16,30,0),
        endDate : new Date(2019,10,26,18,0,0)
      },
      {
        id: 4,
        title: 'A',
        startDate : new Date(2019,10,24,6,0,0),
        endDate : new Date(2019,10,24,7,0,0),
        colour: 'green'
      },
      {
        id: 5,
        title: 'B',
        startDate : new Date(2019,10,25,7,0,0),
        endDate : new Date(2019,10,25,9,0,0),
        colour: 'purple'
      },
      {
        id: 6,
        title: 'C',
        startDate : new Date(2019,10,26,9,0,0),
        endDate : new Date(2019,10,26,12,0,0),
        colour: 'pink'
      },
      {
        id: 7,
        title: 'D',
        startDate : new Date(2019,10,28,6,0,0),
        endDate : new Date(2019,10,28,10,0,0),
        colour: 'teal'
      }
    ]
  }

  allowDrop = (item:SchedulerItem, date:number, hour:number) => {
    return !this.dropFunction || hour>12;
  }

  removeItem = ({item}:any) => {
    this.items = this.items.filter(i => i.id != item.id);
  }

  moveItem = ({item, fullDate, allDay}:any) => {
    let duration = (item.endDate.getTime()-item.startDate.getTime());
    this.items = this.items.map(i => i.id == item.id ? Object.assign({},i,{
      startDate: fullDate,
      endDate: new Date(fullDate.getTime()+duration),
      allDay
    }) : i);
  }

  toggleDay = (event:any, value:number) => {
    if (!event.target.checked) this.selectedDays = this.selectedDays.filter(day => day !== value);
    else if (!~this.selectedDays.indexOf(value)) this.selectedDays = this.selectedDays.concat(value);
  }
}
