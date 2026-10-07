const API_URL = 'http://localhost:3000/api/v1/catalogos';

async function crearCategoria(data: any) {
  const res = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function crearProducto(data: any) {
  const res = await fetch(`${API_URL}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function main() {
  console.log('Creando categorías...');
  
  const catHamburguesas = await crearCategoria({ nombre: 'Hamburguesas', icono: 'fa-burger', orden: 1, estado: 'A' });
  const catPizzas = await crearCategoria({ nombre: 'Pizzas', icono: 'fa-pizza-slice', orden: 2, estado: 'A' });
  const catBebidas = await crearCategoria({ nombre: 'Bebidas', icono: 'fa-glass-water', orden: 3, estado: 'A' });
  const catPostres = await crearCategoria({ nombre: 'Postres', icono: 'fa-ice-cream', orden: 4, estado: 'A' });
  const catEnsaladas = await crearCategoria({ nombre: 'Ensaladas', icono: 'fa-leaf', orden: 5, estado: 'A' });

  console.log('Creando productos...');

  // Hamburguesas (10)
  const hamburguesasData = [
    { nombre: 'Classic Burger', descripcion: 'Carne 200g, lechuga, tomate y salsa especial.', precio: 10.99 },
    { nombre: 'Cheese Burger', descripcion: 'Carne 200g, doble queso cheddar, cebolla caramelizada.', precio: 12.50 },
    { nombre: 'Bacon BBQ Burger', descripcion: 'Carne 200g, tocino crujiente, salsa BBQ, aros de cebolla.', precio: 14.00 },
    { nombre: 'Truffle Mushroom Burger', descripcion: 'Carne 200g, champiñones salteados, aceite de trufa, queso suizo.', precio: 15.99 },
    { nombre: 'Spicy Mexican Burger', descripcion: 'Carne 200g, jalapeños, guacamole, pico de gallo, queso pepper jack.', precio: 13.99 },
    { nombre: 'Chicken Crispy Burger', descripcion: 'Pechuga de pollo crujiente, lechuga, mayonesa de ajo.', precio: 11.99 },
    { nombre: 'Veggie Beyond Burger', descripcion: 'Hamburguesa plant-based, lechuga, tomate, mayonesa vegana.', precio: 14.50 },
    { nombre: 'Double Smash Burger', descripcion: 'Dos carnes smash de 100g, cuádruple queso, salsa secreta.', precio: 16.50 },
    { nombre: 'Blue Cheese Burger', descripcion: 'Carne 200g, queso azul fundido, rúcula, cebolla morada.', precio: 14.99 },
    { nombre: 'Egg & Bacon Burger', descripcion: 'Carne 200g, huevo frito, tocino, queso cheddar.', precio: 15.50 }
  ];

  for (let i = 0; i < hamburguesasData.length; i++) {
    await crearProducto({
      ...hamburguesasData[i],
      categoriaId: catHamburguesas.id,
      areaPreparacion: 'COCINA',
      estado: 'A',
      sku: 'HB-' + Date.now() + '-' + i,
      imagen: `https://loremflickr.com/320/240/burger?random=${i}`
    });
  }

  // Pizzas (8)
  const pizzasData = [
    { nombre: 'Margherita', descripcion: 'Salsa de tomate, mozzarella fior di latte, albahaca fresca.', precio: 12.00 },
    { nombre: 'Pepperoni', descripcion: 'Salsa de tomate, mozzarella, doble pepperoni.', precio: 14.50 },
    { nombre: 'Cuatro Quesos', descripcion: 'Mozzarella, gorgonzola, parmesano, provolone.', precio: 16.00 },
    { nombre: 'Prosciutto e Rucola', descripcion: 'Salsa de tomate, mozzarella, prosciutto crudo, rúcula, parmesano.', precio: 17.50 },
    { nombre: 'Hawaiiana', descripcion: 'Salsa de tomate, mozzarella, jamón, piña asada.', precio: 14.00 },
    { nombre: 'Vegetariana', descripcion: 'Salsa de tomate, mozzarella, pimientos, cebolla, champiñones, aceitunas.', precio: 13.50 },
    { nombre: 'Diavola', descripcion: 'Salsa de tomate, mozzarella, salami picante, peperoncino.', precio: 15.00 },
    { nombre: 'BBQ Chicken', descripcion: 'Salsa BBQ, mozzarella, pollo asado, cebolla morada, cilantro.', precio: 16.50 }
  ];

  for (let i = 0; i < pizzasData.length; i++) {
    await crearProducto({
      ...pizzasData[i],
      categoriaId: catPizzas.id,
      areaPreparacion: 'COCINA',
      estado: 'A',
      sku: 'PZ-' + Date.now() + '-' + i,
      imagen: `https://loremflickr.com/320/240/pizza?random=${i}`
    });
  }

  // Bebidas (8)
  const bebidasData = [
    { nombre: 'Coca Cola', descripcion: 'Lata 350ml', precio: 2.50 },
    { nombre: 'Coca Cola Zero', descripcion: 'Lata 350ml', precio: 2.50 },
    { nombre: 'Sprite', descripcion: 'Lata 350ml', precio: 2.50 },
    { nombre: 'Agua Mineral', descripcion: 'Botella 500ml', precio: 2.00 },
    { nombre: 'Limonada Menta Jengibre', descripcion: 'Limonada natural con menta fresca y jengibre, 400ml.', precio: 4.50 },
    { nombre: 'Jugo Natural Naranja', descripcion: 'Jugo de naranja recién exprimido, 400ml.', precio: 4.00 },
    { nombre: 'Cerveza Artesanal IPA', descripcion: 'Botella 330ml, Cerveza IPA local.', precio: 5.50 },
    { nombre: 'Cerveza Lager', descripcion: 'Lata 473ml', precio: 4.00 }
  ];

  for (let i = 0; i < bebidasData.length; i++) {
    await crearProducto({
      ...bebidasData[i],
      categoriaId: catBebidas.id,
      areaPreparacion: 'BAR',
      estado: 'A',
      sku: 'BBD-' + Date.now() + '-' + i,
      imagen: `https://loremflickr.com/320/240/drink?random=${i}`
    });
  }

  // Postres (5)
  const postresData = [
    { nombre: 'Tiramisú', descripcion: 'Clásico postre italiano con mascarpone, café y cacao.', precio: 6.50 },
    { nombre: 'Cheesecake de Frutos Rojos', descripcion: 'Cheesecake horneado con salsa de frutos rojos de la casa.', precio: 7.00 },
    { nombre: 'Volcán de Chocolate', descripcion: 'Bizcocho de chocolate relleno de fudge caliente, acompañado de helado de vainilla.', precio: 8.50 },
    { nombre: 'Helado Artesanal (2 Bolas)', descripcion: 'Vainilla, Chocolate o Fresa.', precio: 4.50 },
    { nombre: 'Panna Cotta', descripcion: 'Panna cotta de vainilla con coulis de maracuyá.', precio: 6.00 }
  ];

  for (let i = 0; i < postresData.length; i++) {
    await crearProducto({
      ...postresData[i],
      categoriaId: catPostres.id,
      areaPreparacion: 'POSTRES',
      estado: 'A',
      sku: 'PST-' + Date.now() + '-' + i,
      imagen: `https://loremflickr.com/320/240/dessert?random=${i}`
    });
  }

  console.log('¡Base de datos poblada con éxito a través de la API!');
}

main().catch(console.error);
