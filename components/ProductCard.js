// components/ProductCard.js
import Image from 'next/image';

export default function ProductCard({ product }) {
  return (
    <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20">
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-white/70 text-6xl">[Package]</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-white text-lg line-clamp-1">{product.name}</h3>
        {product.categories && (
          <p className="text-pink-200 text-sm mt-1">{product.categories.name}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-white">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          <button className="bg-white text-purple-600 px-4 py-2 rounded-full font-medium hover:bg-pink-50 transition">
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}