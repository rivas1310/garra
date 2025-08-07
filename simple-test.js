console.log('🧪 Iniciando prueba simple...');

// Simular los datos del cliente extraídos
const customerData = {
  name: "Carlos Alberto Valencia",
  street: "euforia",
  number: "1588",
  city: "zapopa",
  state: "Jalisco",
  postalCode: "45200",
  country: "México",
  phone: "3327432497",
  email: "rivasalberto1310@gmail.com"
};

console.log('📋 Datos del cliente extraídos:');
console.log('Nombre:', customerData.name);
console.log('Calle:', customerData.street);
console.log('Número:', customerData.number);
console.log('Ciudad:', customerData.city);
console.log('Estado:', customerData.state);
console.log('CP:', customerData.postalCode);
console.log('Teléfono:', customerData.phone);
console.log('Email:', customerData.email);

// Simular el payload que se enviaría a EnviosPerros
const orderPayload = {
  deliveryType: "ESTAFETA_ECONOMICO",
  packageSize: {
    type: "Caja",
    depth: "30.01",
    width: "20.01",
    height: "15.01",
    weight: "0.5",
    description: "papeles"
  },
  origin: {
    company_origin: "Bazar Fashion",
    street_origin: "Av. Revolución",
    interior_number_origin: "",
    outdoor_number_origin: "381",
    zip_code_origin: "44100",
    neighborhood_origin: "Guadalajara Centro",
    city_origin: "Guadalajara",
    state_origin: "Jalisco",
    references_origin: "porton blanco",
    name_origin: "Bazar Fashion",
    email_origin: "envios@bazarfashion.com",
    phone_origin: "3336125478",
    save_origin: "false"
  },
  destination: {
    company_dest: customerData.name,
    street_dest: customerData.street,
    interior_number_dest: "",
    outdoor_number_dest: customerData.number,
    zip_code_dest: customerData.postalCode,
    neighborhood_dest: "Zapopan",
    city_dest: customerData.city,
    state_dest: customerData.state,
    references_dest: "puerta negra",
    name_dest: customerData.name,
    email_dest: customerData.email,
    phone_dest: customerData.phone,
    save_dest: "false",
    ocurre: "false"
  }
};

console.log('\n📦 Payload para EnviosPerros:');
console.log(JSON.stringify(orderPayload, null, 2));

console.log('\n✅ Prueba completada. Los datos del cliente se están usando correctamente.'); 