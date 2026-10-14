import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesasAdminComponent } from './mesas-admin.component';

describe('MesasAdminComponent', () => {
  let component: MesasAdminComponent;
  let fixture: ComponentFixture<MesasAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesasAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesasAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
