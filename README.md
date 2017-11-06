# ng2-semantic-scheduler
An Angular 4 scheduler for use with Semantic-UI

### Demo:
 [https://chris--jones.github.io/ng2-semantic-scheduler/](https://chris--jones.github.io/ng2-semantic-scheduler/)

**Note: This project is still a work in progress and much is incomplete.**

Features Remaining:
* Event Resizing
* Drag & Drop fixes
* Responsive fixes

### Properties
| Name | Type | Description |
|---|---|---|
| items | SchedulerItem[] | The collection of scheduler items to render in the control
| startDate | Date | The start date
| startHour | number | The start hour (0-22)
| endHour | number | The ending hour of the day (1-23)
| days | number[] | The days to display in the control (0-6)
| showAllDay | boolean | If the all day row should be visible or not
| defaultItemColour | string | The default colour for scheduler items
| allowDrop | Function | A callback function to determine if dropping should be allowed e.g. `function allowDrop (item, date, hour, fullDate) { return hour > 12; }`
| disabled | boolean | If the control should be disabled
| removeButtons | boolean | If remove buttons should be displayed on scheduler items

### Events
| Name | Description | Arguments |
|---|---|---|
| onSlotClick | Event raised when clicking on empty cells in the scheduler | date, hour, fullDate, originalEvent
| onSlotDoubleClick | Event raised when double-clicking on empty cells in the scheduler | date, hour, fullDate, originalEvent
| onSlotHover | Event raised when hovering over empty cells in the scheduler | date, hour, fullDate, originalEvent
| onItemClick | Event raised when clicking on an item in the scheduler | item, originalEvent
| onItemRemove | Event raised when and item is removed from the scheduler | item, originalEvent
| onItemDragStart | Event raised when beginning to drag an item in the scheduler | item, originalEvent
| onItemDragHover | Event raised when dragging an event over a slot in the scheduler | item, originalEvent
| onItemDragEnd  | Event raised when dropping an item in the scheduler | item, originalEvent

### Event Arguments
| Name | Type | Description |
|---|---|---|
| date | number | The day (number) of the month corresponding to the slot |
| hour | number | The hour (0-23) corresponding to the slot
| fullDate | Date | A javascript date object representing the date and hour
| item | SchedulerItem | The scheduler item being interacted with
| originalEvent | Event | The original javascript event

### Interfaces
**SchedulerItem**

| Name | Type | Description |
|---|---|---|
| title | string | The item title
| startDate | Date | The start date (and time) of the item
| endDate (optional) | Date | The end date (and time) of the item
| allDay (optional) | boolean | If the item spans the entire day
| colour (optional) | string | The colour of the item
