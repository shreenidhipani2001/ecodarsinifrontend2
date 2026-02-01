'use client';

import { useEffect, useState, useCallback } from 'react';
import { User as UserIcon, Mail, Phone, Shield, Calendar, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
};

type UserFormData = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
};

const initialFormData: UserFormData = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'USER',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchUsersData = async (): Promise<User[]> => {
  if (!API_URL) throw new Error('API URL not configured');

  const res = await fetch(`${API_URL}/api/users/`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  return Array.isArray(data) ? data : data?.users || data?.data || [];
};

export default function UsersGrid() {
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersData = await fetchUsersData();
      setUsers(usersData);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Could not load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
  };
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
  
    try {
      setIsDeleting(true);
  
      const res = await fetch(
        `${API_URL}/api/users/${userToDelete.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
  
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete user');
      }
  
      toast.success('User deleted successfully');
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      console.log(' error while deleting user ',err);
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!API_URL) throw new Error('API URL not configured');

      const res = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      toast.success('User created successfully!');
      handleCloseModal();
      loadUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'bg-red-900/50 text-red-400 border-red-700';
      case 'USER':
        return 'bg-green-900/50 text-green-400 border-green-700';
      default:
        return 'bg-gray-900/50 text-gray-400 border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4 mx-auto" />
          <p className="text-green-400 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] text-red-400">
        <div className="text-center">
          <p className="text-xl mb-2">Failed to load users</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header with Add User Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-400">Users</h1>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-white text-green-600 px-5 py-2 rounded-full border border-green-400 hover:bg-green-50 transition text-lg font-bold"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {users.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-300px)]">
          <div className="text-center">
            <UserIcon size={64} className="mx-auto text-gray-600 mb-4" />
            <p className="text-xl text-gray-400">No users yet</p>
            <p className="text-sm text-gray-600 mt-2">Users will appear here once they register</p>
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-240px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="relative bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 border border-green-900/30 hover:border-green-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20"
              >
                {/* User Avatar and Name */}
                {/* 3-dot menu */}
<div className="absolute top-4 right-4">
  <button
    onClick={() =>
      setOpenMenuUserId(
        openMenuUserId === user.id ? null : user.id
      )
    }
    className="p-1 rounded-full hover:bg-gray-700 transition"
  >
    <span className="text-xl text-gray-300">⋮</span>
  </button>

  {/* Dropdown */}
  {openMenuUserId === user.id && (
    <div className="absolute right-0 mt-2 w-36 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-20">
      <button
        onClick={() => {
          setUserToDelete(user);
          setOpenMenuUserId(null);
        }}
        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg"
      >
        🗑️ Delete
      </button>
    </div>
  )}
</div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{user.name}</h3>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${getRoleBadgeColor(user.role)}`}>
                      <Shield size={12} />
                      {user.role}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 my-4" />

                {/* Email */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center">
                    <Mail size={14} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-300 truncate" title={user.email}>
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center">
                    <Phone size={14} className="text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-300 truncate">
                      {user.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="sticky bottom-0 mt-6 p-4 bg-gray-900/90 backdrop-blur-sm rounded-xl border border-green-900/30">
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                Total Users: <span className="text-green-400 font-semibold">{users.length}</span>
              </p>
              <p className="text-gray-400">
                Admins:{' '}
                <span className="text-red-400 font-semibold">
                  {users.filter(u => u.role?.toUpperCase() === 'ADMIN').length}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New User</h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-green-600 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                  placeholder="Enter password"
                  required
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Role */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-black"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-screen Loading Spinner */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="w-16 h-16 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {userToDelete && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/60"
      onClick={() => setUserToDelete(null)}
    />

    {/* Modal */}
    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-3">
        Delete User
      </h3>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete{' '}
        <span className="font-semibold">{userToDelete.name}</span>?
        <br />
        This action cannot be undone.
      </p>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setUserToDelete(null)}
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteUser}
          disabled={isDeleting}
          className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
}
