// Componente temporal para forzar la compilación de clases personalizadas
// Este componente nunca se renderiza pero asegura que Tailwind compile todas las clases

const TailwindForcer = () => {
  return (
    <div className="hidden">
      {/* Colores de fondo */}
      <div className="bg-azulrey" />
      <div className="bg-azuloscuro" />
      <div className="bg-azulmedio" />
      <div className="bg-azulturquesa" />
      
      {/* Colores de texto */}
      <div className="text-azulrey" />
      <div className="text-azuloscuro" />
      <div className="text-azulmedio" />
      <div className="text-azulturquesa" />
      
      {/* Bordes */}
      <div className="border-azulrey" />
      <div className="border-azuloscuro" />
      
      {/* Sombras */}
      <div className="shadow-azul shadow-azulrey" />
      
      {/* Estados hover */}
      <div className="hover:bg-azulrey" />
      <div className="hover:bg-azuloscuro" />
      <div className="hover:text-azulrey" />
      <div className="hover:text-azuloscuro" />
      <div className="hover:shadow-azul" />
      <div className="hover:shadow-azulrey" />
      
      {/* Clases de componentes */}
      <button className="btn-primary btn-secondary" />
      <div className="card input-field" />
      
      {/* Clases de altura para ProductCard */}
      <div className="h-64" />
      <div className="h-72" />
      
      {/* Clases de ProductCard faltantes */}
      <div className="group" />
      <div className="overflow-hidden" />
      <div className="hover:rotate-1" />
      <div className="hover:scale-105" />
      <div className="hover:scale-110" />
      <div className="transition-all" />
      <div className="transition-transform" />
      <div className="transition-opacity" />
      <div className="duration-200" />
      <div className="duration-300" />
      <div className="ease-in-out" />
      <div className="object-cover" />
      <div className="group-hover:scale-110" />
      <div className="absolute" />
      <div className="inset-0" />
      <div className="top-2" />
      <div className="top-3" />
      <div className="left-2" />
      <div className="left-3" />
      <div className="right-2" />
      <div className="right-3" />
      <div className="bottom-2" />
      <div className="bg-blue-600" />
      <div className="bg-red-600" />
      <div className="bg-red-500" />
      <div className="bg-green-600" />
      <div className="bg-gray-100" />
      <div className="bg-gray-200" />
      <div className="bg-white" />
      <div className="bg-black/40" />
      <div className="text-white" />
      <div className="text-gray-700" />
      <div className="text-primary-600" />
      <div className="text-yellow-400" />
      <div className="text-xs" />
      <div className="text-sm" />
      <div className="text-lg" />
      <div className="px-2" />
      <div className="px-4" />
      <div className="py-1" />
      <div className="py-2" />
      <div className="p-2" />
      <div className="p-4" />
      <div className="mb-2" />
      <div className="ml-1" />
      <div className="mr-2" />
      <div className="gap-2" />
      <div className="rounded-full" />
      <div className="rounded-lg" />
      <div className="shadow-lg" />
      <div className="hover:bg-gray-200" />
      <div className="hover:text-red-500" />
      <div className="hover:text-primary-600" />
      <div className="opacity-0" />
      <div className="group-hover:opacity-100" />
      <div className="font-medium" />
      <div className="font-semibold" />
      <div className="uppercase" />
      <div className="tracking-wide" />
      <div className="line-through" />
      <div className="line-clamp-2" />
      <div className="fill-current" />
      <div className="flex" />
      <div className="flex-1" />
      <div className="flex-col" />
      <div className="items-center" />
      <div className="items-start" />
      <div className="justify-center" />
      <div className="justify-between" />
      <div className="w-full" />
      <div className="block" />
      <div className="relative" />
      
      {/* Clases de texto */}
      <div className="font-bold" />
    </div>
  );
};

export default TailwindForcer;