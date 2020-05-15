import {
  Component, EventEmitter, OnInit, ViewChild, Output,
} from '@angular/core';

interface TableRow {
  prio: string
  name: string
  socialId: number
  checkupTime: number
  arrivalTime: number
  age: number
  arrivalMethod:string
  team: string
  dr:string
  nurse:string
  astNurse:string
  gender:string
  search:string
  activites:string
}

@Component({
  selector: 'app-overview-table',
  templateUrl: './overview-table.component.html',
  styleUrls: ['./overview-table.component.scss'],

})
export class OverviewTableComponent implements OnInit {
  @ViewChild('myTable') table: any;

  @Output() visitor = new EventEmitter<string>();

  pending = [];

  groups = [];

  teams = [{ name: 'A', check: false }, { name: 'X', check: false }, { name: 'U', check: false }];

  searchRows = [];

  allRows = [];

  showAllTeams = false;

  drList = ['Kerstin', 'David', 'Rakeeb'];

  nurseList = ['Johan', 'Asim', 'Ola'];

  assistantNurseList = ['Madihna', 'Ella', 'Martin'];

  drFilter = undefined;

  nurseFilter = undefined;

  assistantNurseFilter = undefined;

  searchFilter = '';

  rawEvent: any;

  contextmenuRow: any;

  contextmenuColumn: any;

  sortCounter: number = 0;

  ngOnInit(): void {
    this.searchRows = this.allRows;
  }


  loadVisits(loadedRows) {
    loadedRows.forEach((row) => {
      this.allRows.push(this.rowMaker(row));
    });
    this.searchRows = [...this.allRows];
    console.log(this.allRows);
  }

  rowMaker(visit): TableRow {
    const row = {} as TableRow;
    row.team = visit.visitInfo.team;
    row.name = `${visit.person.getFirstName()} ${visit.person.getLastName()}`;
    row.activites = '';
    row.arrivalMethod = visit.visitInfo.arrivalMethod;
    row.arrivalTime = visit.visitInfo.arrivalTime.slice(14, 19);
    row.dr = visit.visitInfo.dr;
    row.search = visit.visitInfo.search;
    row.astNurse = visit.visitInfo.astNurse;
    row.nurse = visit.visitInfo.nurse;
    row.prio = visit.visitInfo.prio;
    row.age = visit.visitInfo.age;
    row.gender = visit.visitInfo.gender;
    row.socialId = visit.person.getId();
    return row;
  }

  addPatient(visit): void {
    this.allRows = this.allRows.concat([visit]);
  }

  resetButtonPressed() {
    this.clearFilters('all');
    this.table.groupHeader.collapseAllGroups();
    this.table.sorts = [];
  }

  clearFilters(option: string): void {
    if (option === 'all' || option === 'checkbox') {
      this.clearCheckboxes('allBox');
      this.clearCheckboxes('teamBoxes');
    }
    if (option === 'all' || option === 'search') {
      this.searchFilter = '';
    }
    if (option === 'all' || option === 'personel') {
      this.nurseFilter = '';
      this.drFilter = '';
      this.assistantNurseFilter = '';
    }
    this.searchRows = this.allRows;
  }

  clickSearchBar(event) {
    console.log(event);
    console.log(event.target.childNodes);
    this.clearCheckboxes('teamBoxes');
    this.clearFilters('personel');
    this.table.groupHeader.collapseAllGroups();
  }

  updateSearchFilter(event): void {
    let val = event.target.value;
    const num2 = isNaN(Number(val));
    // filter our data
    let temp = [];
    if (num2) {
      val = val.toLowerCase();
      temp = this.allRows.filter((d) => d.name.toLowerCase().indexOf(val) !== -1 || !val);
    } else {
      temp = this.allRows.filter((d) => d.socialId.toLowerCase().indexOf(val) !== -1 || !val);
    }
    this.searchRows = temp;
  }

  updateCheckboxFilter(): void {
    this.clearFilters('search');
    this.clearFilters('personel');
    this.clearCheckboxes('allBox');
    let rows = [];
    for (const team of this.teams) {
      if (team.check) {
        rows = rows.concat(this.allRows.filter((d) => d.team.indexOf(team.name) !== -1 || !team.name));
      }
    }
    if (rows.length !== 0) {
      this.searchRows = [...rows];
    } else {
      console.log(this.searchRows.length);
      this.searchRows = this.allRows;
      console.log(this.searchRows.length);
    }
    this.table.groupHeader.collapseAllGroups();
  }

  clearCheckboxes(option: string): void {
    if (option === 'teamBoxes') {
      console.log('Clear team checks');
      for (const team of this.teams) {
        team.check = false;
      }
    } else if (option === 'allBox') {
      console.log('Clear all check');
      this.showAllTeams = false;
    }
  }

  filterWorkers() {
    this.clearFilters('search');
    this.clearCheckboxes('teamBoxes');
    // filter our data
    let empty = 0;
    let temp = [];
    console.log(this.drFilter);
    if (this.drFilter !== undefined) {
      temp = temp.concat(this.allRows.filter((d) => {
        if (d.dr !== undefined){
          return d.dr.indexOf(this.drFilter) !== -1 || !this.drFilter;
        }
      }));
    } else {
      empty += 1;
    }
    if (this.nurseFilter !== undefined) {
      temp = temp.concat(this.allRows.filter((d) => {
        if (d.nurse !== undefined) {
          d.nurse.indexOf(this.nurseFilter) !== -1 || !this.nurseFilter;
        }
      }));
    } else {
      empty += 1;
    }

    if (this.assistantNurseFilter !== undefined) {
      temp = temp.concat(this.allRows.filter((d) => {
        if (d.astNurse !== undefined) {
          d.astNurse.indexOf(this.assistantNurseFilter) !== -1 || !this.assistantNurseFilter;
        }
      }));
    } else {
      empty += 1;
    }
    if (empty === 3) {
      temp = this.allRows;
    }
    this.searchRows = temp;
    if(!this.showAllTeams){
      this.table.groupHeader.collapseAllGroups();
    }
  }

  changeGroupView(): void {
    if (this.table !== undefined) {
      this.clearCheckboxes('teamBoxes');
    }
    this.searchRows = this.allRows;
  }

  sortRows(event): void {
    console.log(event);
    console.log(this.table.sorts);
    console.log(this.sortCounter);
    if (event.prevValue === undefined) {
      this.sortCounter = 0;
    }
    if (this.sortCounter > 1) {
      console.log('clear sorts');
      this.table.sorts = [];
      this.searchRows = [...this.allRows];
      this.sortCounter = 0;
    } else {
      this.sortCounter += 1;
      if (event.newValue !== undefined) {
        const reverse = event.newValue !== 'asc';
        this.searchRows = this.sortProperties(this.searchRows, event.column.prop, reverse);
        if (!this.showAllTeams) {
          this.searchRows = this.sortProperties(this.searchRows, 'team', reverse);
        }
        this.searchRows = [...this.searchRows];
      } else {
        this.searchRows = this.allRows;
      }
    }
  }


  mouseActivity(event: any): void {
    if (event.type === 'click') {
      if (event.column.name === 'Personnummer(år)(kön)') {
        console.log('Clicked Social-id');
        this.visitor.emit(event.row);
      } else if (event.column.name === 'Checkup') {
        console.log('Clicked Checkup');
      } else if (event.column.name === 'Aktivitet') {
        console.log('Clicked Activity');
      } else if (event.column.name === 'Kommentar') {
        console.log('Clicked Comment');
      }
    }
  }


  toggleExpandGroup(group): void {
    console.log('Toggled Expand Group!', group);
    this.table.groupHeader.toggleExpandGroup(group);
  }

  onDetailToggle(event) {
    console.log('Detail Toggled', event);
  }


  sortProperties(obj, sortedBy, reverse) {
    console.log(obj);
    sortedBy = sortedBy || 1; // by default first key
    const isNumericSort = typeof obj[0][sortedBy] === 'number'; // by default text sort

    reverse = reverse || false; // by default no reverse

    const reversed = (reverse) ? -1 : 1;

    const sortable = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sortable.push(obj[key]);
      }
    }
    console.log(sortable);
    if (isNumericSort) {
      sortable.sort((a, b) => reversed * (a[sortedBy] - b[sortedBy]));
    } else {
      sortable.sort((a, b) => {
        const x = a[sortedBy];
        const y = b[sortedBy];
        return x < y ? reversed * -1 : x > y ? reversed : 0;
      });
    }
    return sortable;
  }

  onTableContextMenu(contextMenuEvent) {
    console.log(contextMenuEvent);

    this.rawEvent = contextMenuEvent.event;
    if (contextMenuEvent.type === 'body') {
      this.contextmenuRow = contextMenuEvent.content;
      this.contextmenuColumn = undefined;
    } else {
      this.contextmenuColumn = contextMenuEvent.content;
      this.contextmenuRow = undefined;
    }

    contextMenuEvent.event.preventDefault();
    contextMenuEvent.event.stopPropagation();
  }
}
