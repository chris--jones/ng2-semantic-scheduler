import { Component } from '@angular/core';
import '../assets/css/styles.less';
import { ScheduledEvent } from './scheduler/scheduler.component';
const ComponentStyle = require('!raw-loader!less-loader!./app.component.less');

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ ComponentStyle ]
})

export class AppComponent {
  date: Date;
  events: ScheduledEvent[];
  showAllDay: boolean = true;
  allowRemove: boolean = true;
  dropFunction: boolean = false;

  constructor(){
    if (!this.date) this.date = new Date();
    this.events = [
      {
        id: 1,
        title: "Gerard's Birthday",
        startDate : new Date(2019,10,27,8,0,0),
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
        endDate : new Date(2019,10,28,18,0,0),
        colour: 'teal'
      }
    ]
  }

  allowDrop = (event:ScheduledEvent, date:number, hour:number) => {
    return !this.dropFunction || hour>12;
  }

  removeEvent = ({event}:any) => {
    this.events = this.events.filter(e => e.id != event.id);
  }

  moveEvent = ({event, fullDate}:any) => {
    let duration = (event.endDate.getTime()-event.startDate.getTime());
    this.events = this.events.map(e => e.id == event.id ? Object.assign({},e,{
      startDate: fullDate,
      endDate: new Date(fullDate.getTime()+duration)
    }) : e);
  }
}
