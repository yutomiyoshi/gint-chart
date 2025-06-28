import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueColumnComponent } from './issue-column.component';

describe('IssueColumnComponent', () => {
  let component: IssueColumnComponent;
  let fixture: ComponentFixture<IssueColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueColumnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IssueColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
