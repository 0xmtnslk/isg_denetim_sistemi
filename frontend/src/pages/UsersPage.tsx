import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Key, UserCheck, UserX } from 'lucide-react';
import { apiClient } from '@/api/client';
import { User, Group, PaginatedResponse } from '@/types';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';

interface UserFormData {
  username: string;
  email: string;
  password?: string;
  fullName: string;
  role: 'ADMIN' | 'ISG_UZMANI' | 'DENETCI';
  groupId?: number | null;
}

const roleLabels = {
  ADMIN: 'Yönetici',
  ISG_UZMANI: 'İSG Uzmanı',
  DENETCI: 'Denetçi',
};

export default function UsersPage() {
  const { isAdmin } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'DENETCI',
    groupId: null,
  });
  const [newPassword, setNewPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, [currentPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit,
      };
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;

      const response = await apiClient.get<PaginatedResponse<User>>('/users', { params });
      setUsers(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get<PaginatedResponse<Group>>('/groups', {
        params: { limit: 100 },
      });
      setGroups(response.data.data);
    } catch (error) {
      console.error('Gruplar yüklenirken hata:', error);
    }
  };

  const validateForm = (data: UserFormData, isEdit: boolean = false): boolean => {
    const errors: Record<string, string> = {};

    if (!data.username.trim()) {
      errors.username = 'Kullanıcı adı zorunludur';
    } else if (data.username.length < 3) {
      errors.username = 'Kullanıcı adı en az 3 karakter olmalıdır';
    }

    if (!data.email.trim()) {
      errors.email = 'E-posta zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz';
    }

    if (!isEdit && data.password) {
      if (data.password.length < 6) {
        errors.password = 'Şifre en az 6 karakter olmalıdır';
      }
    }

    if (!data.fullName.trim()) {
      errors.fullName = 'Tam ad zorunludur';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm(formData)) return;

    try {
      setSubmitting(true);
      await apiClient.post('/users', formData);
      toast.success('Kullanıcı başarıyla eklendi');
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kullanıcı eklenirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !validateForm(formData, true)) return;

    try {
      setSubmitting(true);
      const { password, ...updateData } = formData;
      await apiClient.patch(`/users/${selectedUser.id}`, updateData);
      toast.success('Kullanıcı başarıyla güncellendi');
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kullanıcı güncellenirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      await apiClient.delete(`/users/${selectedUser.id}`);
      toast.success('Kullanıcı başarıyla silindi');
      setShowDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kullanıcı silinirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;

    if (newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.patch(`/users/${selectedUser.id}/password`, { newPassword });
      toast.success('Şifre başarıyla değiştirildi');
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Şifre değiştirilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await apiClient.patch(`/users/${user.id}/status`, { isActive: !user.isActive });
      toast.success(`Kullanıcı ${!user.isActive ? 'aktif' : 'pasif'} edildi`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Durum değiştirilirken hata oluştu');
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      groupId: user.groupId || null,
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'DENETCI',
      groupId: null,
    });
    setFormErrors({});
    setSelectedUser(null);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <LoadingSpinner text="Kullanıcılar yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          {isAdmin() && (
            <Button onClick={openAddModal}>
              <Plus className="w-5 h-5 mr-2" />
              Yeni Kullanıcı
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Kullanıcı adı, e-posta veya tam ad ile ara..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value)}
              options={[
                { value: '', label: 'Tüm Roller' },
                { value: 'ADMIN', label: 'Yönetici' },
                { value: 'ISG_UZMANI', label: 'İSG Uzmanı' },
                { value: 'DENETCI', label: 'Denetçi' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="Kullanıcı Bulunamadı"
          description="Henüz hiç kullanıcı eklenmemiş veya arama kriterlerinize uygun kullanıcı bulunamadı."
          actionLabel={isAdmin() ? 'Yeni Kullanıcı Ekle' : undefined}
          onAction={isAdmin() ? openAddModal : undefined}
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Kullanıcı Adı</TableHeader>
                <TableHeader>E-posta</TableHeader>
                <TableHeader>Tam Ad</TableHeader>
                <TableHeader>Rol</TableHeader>
                <TableHeader>Grup</TableHeader>
                <TableHeader>Durum</TableHeader>
                {isAdmin() && <TableHeader className="text-right">İşlemler</TableHeader>}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>
                    <Badge variant="info">{roleLabels[user.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.group ? user.group.name : <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => isAdmin() && handleToggleStatus(user)}
                      disabled={!isAdmin()}
                      className={`inline-flex items-center gap-1 ${isAdmin() ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {user.isActive ? (
                        <>
                          <UserCheck className="w-4 h-4 text-green-600" />
                          <Badge variant="success">Aktif</Badge>
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4 text-red-600" />
                          <Badge variant="danger">Pasif</Badge>
                        </>
                      )}
                    </button>
                  </TableCell>
                  {isAdmin() && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openPasswordModal(user)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Şifre Değiştir"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="p-6 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Toplam {total} kullanıcıdan {(currentPage - 1) * limit + 1}-
                {Math.min(currentPage * limit, total)} arası gösteriliyor
              </p>
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </div>
          </div>
        </>
      )}

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni Kullanıcı Ekle" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kullanıcı Adı"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={formErrors.username}
              required
            />
            <Input
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tam Ad"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              error={formErrors.fullName}
              required
            />
            <Input
              label="Şifre"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={formErrors.password}
              required
              helperText="En az 6 karakter"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Rol"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              options={[
                { value: 'ADMIN', label: 'Yönetici' },
                { value: 'ISG_UZMANI', label: 'İSG Uzmanı' },
                { value: 'DENETCI', label: 'Denetçi' },
              ]}
              required
            />
            <Select
              label="Grup"
              value={formData.groupId || ''}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value ? Number(e.target.value) : null })}
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
              placeholder="Grup seçiniz (opsiyonel)"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              İptal
            </Button>
            <Button onClick={handleAddUser} loading={submitting}>
              Kullanıcı Ekle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Kullanıcıyı Düzenle" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kullanıcı Adı"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              error={formErrors.username}
              required
            />
            <Input
              label="E-posta"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              required
            />
          </div>
          <Input
            label="Tam Ad"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={formErrors.fullName}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Rol"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              options={[
                { value: 'ADMIN', label: 'Yönetici' },
                { value: 'ISG_UZMANI', label: 'İSG Uzmanı' },
                { value: 'DENETCI', label: 'Denetçi' },
              ]}
              required
            />
            <Select
              label="Grup"
              value={formData.groupId || ''}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value ? Number(e.target.value) : null })}
              options={groups.map((g) => ({ value: g.id, label: g.name }))}
              placeholder="Grup seçiniz (opsiyonel)"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              İptal
            </Button>
            <Button onClick={handleEditUser} loading={submitting}>
              Güncelle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Şifre Değiştir" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            <strong>{selectedUser?.fullName}</strong> kullanıcısının şifresini değiştiriyorsunuz.
          </p>
          <Input
            label="Yeni Şifre"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helperText="En az 6 karakter"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              İptal
            </Button>
            <Button onClick={handleChangePassword} loading={submitting}>
              Şifre Değiştir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteUser}
        title="Kullanıcıyı Sil"
        message={`${selectedUser?.fullName} kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        loading={submitting}
      />
    </div>
  );
}
