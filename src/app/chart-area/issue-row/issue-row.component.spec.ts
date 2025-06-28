import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueRowComponent } from './issue-row.component';

describe('IssueRowComponent', () => {
  let component: IssueRowComponent;
  let fixture: ComponentFixture<IssueRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IssueRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IssueRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
