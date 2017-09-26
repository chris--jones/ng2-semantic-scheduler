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

  constructor(){
    if (!this.date) this.date = new Date();
    this.events = [
      {
        title: "Gerard's Birthday",
        startDate : new Date(2019,10,27,8,0,0),
        endDate : new Date(2019,10,27,10,0,0),
        colour: 'red'
      },
      {
        title: "Lunch Date",
        startDate : new Date(2019,10,24,12,0,0),
        endDate : new Date(2019,10,24,13,30,0),
        colour: 'orange'
      },
      {
        title: "Appointment",
        startDate : new Date(2019,10,26,16,30,0),
        endDate : new Date(2019,10,26,18,0,0),
      }
    ]
  }

  incrementDate():void {
    this.date.setDate(this.date.getDate()+1);
  }

  decrementDate():void {
    this.date.setDate(this.date.getDate()-1);
  }

}
