import React from 'react';
import { Users, Heart, Leaf, Star, CheckCircle, Globe, Hand } from 'lucide-react';

export default function QuienesSomos() {
  return (
    <section className="max-w-5xl mx-auto my-16 bg-white rounded-2xl shadow-2xl p-8 border border-primary-100 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary-700 mb-4 flex items-center justify-center gap-3">
          <Users className="inline-block w-10 h-10 text-primary-500" /> ¿Quiénes somos?
        </h1>
        <p className="text-xl text-neutral-700 max-w-2xl mx-auto">
          En <span className="font-bold text-primary-600">Garras Felinas</span> damos nueva vida a la moda y apoyamos el talento local. Somos una tienda de ropa de segunda mano y nueva, accesorios y calzado para toda la familia.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-10">
        <div className="bg-primary-50 rounded-xl p-6 flex flex-col gap-4 shadow-sm border border-primary-100">
          <h2 className="text-2xl font-bold text-primary-700 flex items-center gap-2">
            <Heart className="w-7 h-7 text-primary-500" /> Nuestra misión
          </h2>
          <p className="text-lg text-neutral-700">
            Conectamos moda, sostenibilidad y talento local. Queremos que más personas vistan bien, ahorren dinero y apoyen el crecimiento de marcas mexicanas. Cada prenda cuenta una historia, y contigo, puede tener un nuevo comienzo.
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 flex flex-col gap-4 shadow-sm border border-green-200">
          <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <Leaf className="w-7 h-7 text-green-600" /> Moda con conciencia
          </h2>
          <p className="text-lg text-neutral-700">
            La industria de la moda es una de las más contaminantes del planeta. En <span className="font-semibold text-primary-600">Garras Felinas</span> promovemos el consumo responsable, la reutilización de prendas y el apoyo a emprendedores mexicanos.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-10">
        <div className="flex flex-col items-center text-center bg-white rounded-xl p-6 border border-primary-100 shadow-sm">
          <Star className="w-10 h-10 text-yellow-400 mb-2" />
          <h3 className="font-semibold text-lg mb-1">Selección de calidad</h3>
          <p className="text-neutral-600">Ropa y accesorios cuidadosamente seleccionados, en excelente estado y con estilo.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white rounded-xl p-6 border border-primary-100 shadow-sm">
          <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
          <h3 className="font-semibold text-lg mb-1">Precios accesibles</h3>
          <p className="text-neutral-600">Ofrecemos moda para todos los bolsillos, sin sacrificar calidad ni estilo.</p>
        </div>
        <div className="flex flex-col items-center text-center bg-white rounded-xl p-6 border border-primary-100 shadow-sm">
          <Hand className="w-10 h-10 text-primary-500 mb-2" />
          <h3 className="font-semibold text-lg mb-1">Apoyo a emprendedores</h3>
          <p className="text-neutral-600">Impulsamos a productores y marcas mexicanas, promoviendo el consumo local y ético.</p>
        </div>
      </div>

      <div className="bg-primary-50 rounded-xl p-6 flex flex-col gap-4 shadow-sm border border-primary-100 mb-10">
        <h2 className="text-2xl font-bold text-primary-700 flex items-center gap-2">
          <Globe className="w-7 h-7 text-primary-500" /> Nuestra promesa
        </h2>
        <ul className="list-disc pl-6 text-lg text-neutral-700 space-y-2">
          <li>♻️ Apostamos por una moda circular y sostenible.</li>
          <li>♻️ Damos una segunda oportunidad a prendas que aún tienen mucho por ofrecer.</li>
          <li>🤝 Apoyamos a quienes producen de forma ética, artesanal y consciente.</li>
        </ul>
      </div>

      <div className="text-center mt-8">
        <p className="text-xl font-bold text-primary-700 mb-2">Ser parte del cambio está en tus manos.</p>
        <p className="text-lg text-neutral-700 font-semibold">
          Vístete con causa. Vístete con conciencia. <span className="text-green-700">🌿</span>
        </p>
      </div>
    </section>
  );
}