import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDetalleProductoComponent } from './modal-detalle-producto.component';

describe('ModalDetalleProductoComponent', () => {
  let component: ModalDetalleProductoComponent;
  let fixture: ComponentFixture<ModalDetalleProductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDetalleProductoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalDetalleProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
