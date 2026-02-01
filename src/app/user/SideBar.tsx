// 'use client';

// import {
//   CircleUser,
//   Heart,
//   ShoppingCart,
//   ChevronLeft,
//   ChevronRight,
// } from 'lucide-react';
// import Link from 'next/link';
// import Logo from '../../../public/svg/Logo';

// interface SidebarProps {
//   isOpen: boolean;
//   onToggle: () => void;
// }

// export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
//   const navItems = [
//     {
//       name: 'Profile',
//       icon: CircleUser,
//       href: '/dashboard/profile',
//       color: 'text-yellow-500',
//     },
//     {
//       name: 'Wishlist',
//       icon: Heart,
//       href: '/dashboard/wishlist',
//       color: 'text-red-500',
//     },
//     {
//       name: 'Cart',
//       icon: ShoppingCart,
//       href: '/dashboard/cart',
//       color: 'text-blue-600',
//     },
//   ];

//   return (
//     <aside
//       className={`
//         bg-black text-white transition-all duration-300 ease-in-out
//         ${isOpen ? 'w-64' : 'w-20'}
//         flex flex-col h-full relative
//       `}
//     >
//       {/* Toggle */}
//       <button
//         onClick={onToggle}
//         className="absolute -right-3 top-6 bg-black text-white rounded-full p-1.5 border border-gray-700 hover:bg-gray-800 transition"
//       >
//         {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
//       </button>

//       {/* Header */}
//       <div className={`${isOpen ? 'p-6' : 'p-4'} transition-all`}>
//         <div
//           className={`flex items-center ${
//             isOpen ? 'gap-3 justify-start' : 'justify-center'
//           } mb-10`}
//         >
//           <Logo className="w-10 h-auto shrink-0" />
//           {isOpen && <span className="text-xl font-semibold">Ecodarshini</span>}
//         </div>

//         {/* Nav */}
//         <nav className="space-y-2">
//           {navItems.map((item) => (
//             <Link
//               key={item.name}
//               href={item.href}
//               className={`
//                 flex items-center rounded-lg transition-colors
//                 hover:bg-gray-800
//                 ${isOpen ? 'gap-4 px-4 py-3' : 'justify-center p-3'}
//               `}
//             >
//               <item.icon className={`w-6 h-6 ${item.color} shrink-0`} />
//               {isOpen && <span className="font-medium">{item.name}</span>}
//             </Link>
//           ))}
//         </nav>
//       </div>
//     </aside>
//   );
// }


'use client';

import {
  CircleUser,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MapPin,Home
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Logo from '../../../public/svg/Logo';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenModal: (type: 'profile' | 'cart' | 'wishlist' |'track') => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  onOpenModal,
}: SidebarProps) {
  const router = useRouter();
  const { clearUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Logout failed');
      }

      clearUser();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    {
      name: 'Home',
      icon: Home,
      color: 'text-green-500',
      key: 'home',
    },
    {
      name: 'Profile',
      icon: CircleUser,
      color: 'text-yellow-500',
      key: 'profile',
    },
    {
      name: 'Wishlist',
      icon: Heart,
      color: 'text-red-500',
      key: 'wishlist',
    },
    {
      name: 'Cart',
      icon: ShoppingCart,
      color: 'text-blue-600',
      key: 'cart',
    },
    {
      name: 'Track Order',
      icon: MapPin,
      color: 'text-yellow-500',
      key: 'track',
    }
  ] as const;

  return (
    <aside
      className={`
        bg-black text-white transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-20'}
        flex flex-col h-full relative
      `}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 bg-black text-white rounded-full p-1.5 border border-gray-700 hover:bg-gray-800 transition"
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Header */}
      <div className={`${isOpen ? 'p-6' : 'p-4'} transition-all`}>
        <div
          className={`flex items-center ${
            isOpen ? 'gap-3 justify-start' : 'justify-center'
          } mb-10`}
        >
          <Logo className="w-10 h-auto shrink-0" />
          {isOpen && (
            <span className="text-xl font-semibold tracking-wide">
              Ecodarshini
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === 'home') {
                  router.push('/');
                } else {
                  onOpenModal(item.key);
                }
              }}
              className={`
                w-full flex items-center rounded-lg transition-colors
                hover:bg-gray-800 focus:outline-none
                ${isOpen ? 'gap-4 px-4 py-3' : 'justify-center p-3'}
              `}
            >
              <item.icon
                className={`w-6 h-6 ${item.color} shrink-0`}
              />
              {isOpen && (
                <span className="font-medium">{item.name}</span>
              )}
            </button>
          ))}
        </nav>
        <button
  onClick={handleLogout}
  className={`
    w-full flex items-center rounded-lg transition-colors
    hover:bg-red-900/30 text-red-400 hover:text-red-300 focus:outline-none
    ${isOpen ? 'gap-4 px-4 py-3' : 'justify-center p-3'}
  `}
>
  <LogOut className="w-6 h-6 shrink-0" />
  {isOpen && <span className="font-medium">Logout</span>}
</button>
      </div>

      {/* Logout Button at Bottom */}
      {/* <div className="mt-auto p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center rounded-lg transition-colors
            hover:bg-red-900/30 text-red-400 hover:text-red-300 focus:outline-none
            ${isOpen ? 'gap-4 px-4 py-3' : 'justify-center p-3'}
          `}
        >
          <LogOut className="w-6 h-6 shrink-0" />
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div> */}
    </aside>
  );
}
