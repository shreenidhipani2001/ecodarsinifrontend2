'use client';

import { ArrowRight, Leaf, Recycle, TreePine } from 'lucide-react';

interface HeroBannerProps {
  onShopNowClick: () => void;
}

export default function HeroBanner({ onShopNowClick }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full" />
        <div className="absolute top-20 right-20 w-48 h-48 border border-white rounded-full" />
        <div className="absolute bottom-10 left-1/4 w-24 h-24 border border-white rounded-full" />
        <div className="absolute bottom-20 right-1/3 w-16 h-16 border border-white rounded-full" />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden">
        <Leaf className="absolute top-16 left-[15%] h-8 w-8 text-green-400/30 animate-pulse" />
        <TreePine className="absolute top-32 right-[20%] h-10 w-10 text-green-400/20 animate-pulse" style={{ animationDelay: '1s' }} />
        <Recycle className="absolute bottom-24 left-[10%] h-12 w-12 text-green-400/20 animate-pulse" style={{ animationDelay: '2s' }} />
        <Leaf className="absolute bottom-16 right-[15%] h-6 w-6 text-green-400/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 bg-green-500/20 text-green-300 text-sm font-medium rounded-full mb-4">
              Sustainable Living
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Discover
              <span className="text-green-400"> Eco-Friendly </span>
              Products
            </h1>
            <p className="text-lg text-green-100/80 mb-8 max-w-lg mx-auto lg:mx-0">
              Shop consciously with our curated collection of sustainable,
              earth-friendly products. Every purchase makes a difference.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onShopNowClick}
                className="inline-flex items-center justify-center gap-2 bg-white text-green-800 px-8 py-3.5 rounded-full font-semibold hover:bg-green-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={onShopNowClick}
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/30 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 transition-all"
              >
                View Collection
              </button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-green-200/70">Eco Products</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-sm text-green-200/70">Happy Customers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-sm text-green-200/70">Sustainable</div>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">100% Organic</h3>
                <p className="text-green-200/70 text-sm">
                  All products made from natural, organic materials
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Recycle className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Recyclable</h3>
                <p className="text-green-200/70 text-sm">
                  Packaging that cares for the environment
                </p>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="h-12 w-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <TreePine className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Plant a Tree</h3>
                <p className="text-green-200/70 text-sm">
                  We plant a tree for every order placed
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6">
                <div className="text-white font-bold text-2xl mb-1">20% OFF</div>
                <div className="text-green-100 text-sm mb-3">First Order</div>
                <div className="text-white/80 text-xs">Use code: ECO20</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 36.7 768 43.3 864 45C960 46.7 1056 43.3 1152 38.3C1248 33.3 1344 26.7 1392 23.3L1440 20V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
