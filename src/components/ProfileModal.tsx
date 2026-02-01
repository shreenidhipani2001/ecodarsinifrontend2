// 'use client';

// import { useState } from 'react';
// import BaseModal from './BaseModal';
// import { updateUserProfile } from '../../lib/userApi';
// import toast from 'react-hot-toast';
// import { Edit2, Save, X } from 'lucide-react';
// import { useAuthStore } from '../store/useAuthStore';

// export default function ProfileModal({
//   user,
//   onClose,
// }: {
//   user: any;
//   onClose: () => void;
// }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const { setUser } = useAuthStore();

//   const [formData, setFormData] = useState({
//     name: user?.name || '',
//     email: user?.email || '',
//     phone: user?.phone || '',
//     password: '',
//   });

//   if (!user) return null;
// console.log('Rendering ProfileModal for user:', user);
// console.log('Initial formData:', formData);
//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const updates: any = {
//         name: formData.name,
//         email: formData.email,
//         phone: formData.phone,
//       };

//       // Only include password if it was changed
//       if (formData.password) {
//         updates.password = formData.password;
//       }

//       const response = await updateUserProfile(user.id, updates);
//       // Handle both nested and flat response structures
//       const updatedUser = response.user || response;
//       toast.success('Profile updated successfully!');

//       // Update the auth store with complete user data
//       setUser({
//         id: updatedUser.id || user.id,
//         email: updatedUser.email || formData.email,
//         role: updatedUser.role || user.role,
//         name: updatedUser.name || formData.name,
//         phone: updatedUser.phone || formData.phone,
//       });

//       setIsEditing(false);
//       setFormData({ ...formData, password: '' }); // Clear password field
//     } catch (err) {
//       console.error('Failed to update profile:', err);
//       toast.error('Failed to update profile');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleCancel = () => {
//     setFormData({
//       name: user?.name || '',
//       email: user?.email || '',
//       phone: user?.phone || '',
//       password: '',
//     });
//     setIsEditing(false);
//   };

//   return (
//     <BaseModal title="My Profile" onClose={onClose}>
//       <div className="flex flex-col md:flex-row gap-6 bg-green-400 p-8 rounded-2xl shadow-xl">
//       {/* <div className="
//   flex flex-col md:flex-row gap-6
//   bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-700
//   p-8 rounded-2xl
//   shadow-[0_10px_30px_rgba(0,0,0,0.12)]
//   border border-white/40
// "> */}

//         {/* Left Half - Big Avatar */}
//         <div className="flex justify-center items-center md:w-1/3">
//           <div className="h-40 w-40 rounded-full bg-green-600 flex items-center justify-center text-white text-6xl font-bold shadow-lg">
//             {formData.name?.charAt(0).toUpperCase()}
//           </div>
//         </div>

//         {/* Right Half - User Info */}
//         <div className="flex flex-col justify-center md:w-2/3 gap-4">
//           {!isEditing ? (
//             <>
//               {/* View Mode */}
//               <div>
//                 <span className="text-black font-bold text-lg">Name:</span> 
//                 <p className="text-black font-semibold text-xl mt-1">{user?.name}</p>
//                 {/* <p className="text-gray-800 font-semibold text-xl mt-1">{user?.name}</p> */}
//               </div>

//               <div>
//                 <span className="text-black font-bold text-lg">Role:</span>
//                 <p className="text-black font-semibold text-xl mt-1 capitalize">{user.role}</p>
//               </div>

//               <div>
//                 <span className="text-blackfont-bold text-lg text-black font-bold">Email:</span>
//                 <p className="text-black font-semibold text-xl mt-1">{formData.email}</p>
//                 {/* <p className="text-gray-800 font-semibold text-xl mt-1">{user.email}</p> */}
//               </div>

//               {user.phone && (
//                 <div>
//                   <span className="text-black font-bold text-lg">Phone:</span>
//                   <p className="text-black font-semibold text-xl mt-1">{user.phone}</p>
//                 </div>
//               )}

//               <button
//                 onClick={() => setIsEditing(true)}
//                 className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold"
//               >
//                 <Edit2 size={18} />
//                 Edit Profile
//               </button>
//             </>
//           ) : (
//             <>
//               {/* Edit Mode */}
//               <div>
//                 <label className="text-gray-700 font-bold text-sm block mb-1">Name</label>
//                 <input
//                   type="text"
//                   value={formData?.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-4 text-black py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//                 />
//               </div>

//               <div>
//                 <label className="text-gray-700 font-bold text-sm block mb-1">Email</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
//                 />
//               </div>

//               <div>
//                 <label className="text-gray-700 font-bold text-sm block mb-1">Phone</label>
//                 <input
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                   className="w-full text-black px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//                 />
//               </div>

//               <div>
//                 <label className="text-gray-700 font-bold text-sm block mb-1">
//                   New Password (leave blank to keep current)
//                 </label>
//                 <input
//                   type="password"
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   placeholder="Enter new password"
//                   className="w-full text-black px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//                 />
//               </div>

//               <div className="flex gap-3 mt-4">
//                 <button
//                   onClick={handleSave}
//                   disabled={saving}
//                   className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
//                 >
//                   <Save size={18} />
//                   {saving ? 'Saving...' : 'Save Changes'}
//                 </button>
//                 <button
//                   onClick={handleCancel}
//                   disabled={saving}
//                   className="px-6 py-3 bg-red-400 text-white rounded-lg hover:bg-gray-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
//                 >
//                   <X size={18} />
//                   Cancel
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </BaseModal>
//   );
// }



'use client';

import { useState } from 'react';
import BaseModal from './BaseModal';
import { updateUserProfile } from '../../lib/userApi';
import toast from 'react-hot-toast';
import { Edit2, Save, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfileModal({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { setUser } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
  });

  if (!user) return null;
console.log('Rendering ProfileModal for user:', user);
console.log('Initial formData:', formData);
  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      // Only include password if it was changed
      if (formData.password) {
        updates.password = formData.password;
      }

      const response = await updateUserProfile(user.id, updates);
      // Handle both nested and flat response structures
      const updatedUser = response.user || response;
      toast.success('Profile updated successfully!');

      // Update the auth store with complete user data
      setUser({
        id: updatedUser.id || user.id,
        email: updatedUser.email || formData.email,
        role: updatedUser.role || user.role,
        name: updatedUser.name || formData.name,
        phone: updatedUser.phone || formData.phone,
      });

      setIsEditing(false);
      setFormData({ ...formData, password: '' }); // Clear password field
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
    });
    setIsEditing(false);
  };

  return (
    <BaseModal title="My Profile" onClose={onClose}>
      <div className="flex flex-col md:flex-row gap-6 bg-emerald-50 p-8 rounded-2xl shadow-xl">
      {/* <div className="
  flex flex-col md:flex-row gap-6
  bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-700
  p-8 rounded-2xl
  shadow-[0_10px_30px_rgba(0,0,0,0.12)]
  border border-white/40
"> */}

        {/* Left Half - Big Avatar */}
        <div className="flex justify-center items-center md:w-1/3">
          <div className="h-40 w-40 rounded-full bg-green-600 flex items-center justify-center text-white text-6xl font-bold shadow-lg">
            {formData.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Right Half - User Info */}
        <div className="flex flex-col justify-center md:w-2/3 gap-4">
          {!isEditing ? (
            <>
              {/* View Mode */}
              <div>
                <span className="text-gray-700 font-bold text-lg">Name:</span> 
                <p className="text-black font-semibold text-xl mt-1">{user?.name}</p>
                {/* <p className="text-gray-800 font-semibold text-xl mt-1">{user?.name}</p> */}
              </div>

              <div>
                <span className="text-gray-700 font-bold text-lg">Role:</span>
                <p className="text-black font-semibold text-xl mt-1 capitalize">{user.role}</p>
              </div>

              <div>
                <span className="text-blackfont-bold text-lg text-gray-700 font-bold">Email:</span>
                <p className="text-black font-semibold text-xl mt-1">{formData.email}</p>
                {/* <p className="text-gray-800 font-semibold text-xl mt-1">{user.email}</p> */}
              </div>

              {user.phone && (
                <div>
                  <span className="text-gray-700 font-bold text-lg">Phone:</span>
                  <p className="text-black font-semibold text-xl mt-1">{user.phone}</p>
                </div>
              )}

              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div>
                <label className="text-gray-700 font-bold text-sm block mb-1">Name</label>
                <input
                  type="text"
                  value={formData?.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 text-black py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold text-sm block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold text-sm block mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-black px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold text-sm block mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full text-black px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50 text-white"
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-400 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
