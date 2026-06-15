import React from 'react'
import { Product } from '../types'

interface ProductCartProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

function ProductCart({ products, onAddToCart }: ProductCartProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((prod) => (
        <div
          key={prod.id}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-900/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-700/25"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-amber-100">
            <img
              src={prod.imageUrl}
              alt={prod.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute top-3 inset-x-3 flex justify-between items-start">
              <span className="rounded-md bg-white/95 backdrop-blur-sm px-2 py-0.5 font-mono text-[9.5px] font-bold text-amber-950 shadow-sm">
                {prod.volume}
              </span>
              {prod.stock < 10 && prod.stock > 0 && (
                <span className="rounded-md bg-amber-700 px-2 py-0.5 font-mono text-[9.5px] font-bold text-white uppercase shadow-sm">
                  Only {prod.stock} Left
                </span>
              )}
              {prod.stock === 0 && (
                <span className="rounded-md bg-gray-600 px-2 py-0.5 font-mono text-[9.5px] font-bold text-white uppercase shadow-sm">
                  Sold Out
                </span>
              )}
            </div>

            {prod.salesCount > 150 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-amber-950/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold text-amber-400">
                <i className="fas fa-star"></i>
                <span>Bestseller</span>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5">
            <p className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-amber-700">{prod.category}</p>
            <h4 className="mt-1 font-heading text-base font-bold text-amber-950 line-clamp-1 group-hover:text-amber-800 transition-colors">
              {prod.name}
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-amber-900/70 line-clamp-2">
              {prod.description}
            </p>

            <div className="mt-auto pt-4 flex items-center justify-between border-t border-amber-900/5">
              <div>
                <span className="font-mono text-[10px] text-amber-700 font-bold block leading-none">Price</span>
                <span className="text-xl font-black text-amber-950">₹{prod.price}</span>
              </div>

              <button
                type="button"
                onClick={() => prod.stock > 0 && onAddToCart(prod)}
                disabled={prod.stock === 0}
                className={`inline-flex items-center gap-1.5 rounded-2 p-2 small font-semibold transition-all cursor-pointer ${
                  prod.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-amber-900 hover:bg-amber-950 text-white shadow-md shadow-amber-900/10'
                }`}
              >
                <i className="fas fa-cart-shopping"></i>
                <span>{prod.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductCart