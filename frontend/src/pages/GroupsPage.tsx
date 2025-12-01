import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Users as UsersIcon, UserPlus, UserMinus, ChevronDown, ChevronUp } from 'lucide-react';
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
import { TableHead, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';

interface GroupFormData {
  name: string;
  description: string;
}

export default function GroupsPage() {
  const { isAdmin } = useAuthStore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
  const limit = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
  });
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchGroups();
    fetchAllUsers();
  }, [currentPage, searchTerm]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit,
      };
      if (searchTerm) params.search = searchTerm;

      const response = await apiClient.get<PaginatedResponse<Group>>('/groups', { params });
      setGroups(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Gruplar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await apiClient.get<PaginatedResponse<User>>('/users', {
        params: { limit: 1000 },
      });
      setAllUsers(response.data.data);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    }
  };

  const fetchGroupDetails = async (groupId: number): Promise<Group | null> => {
    try {
      const response = await apiClient.get<Group>(`/groups/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Grup detayları yüklenirken hata:', error);
      return null;
    }
  };

  const validateForm = (data: GroupFormData): boolean => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
      errors.name = 'Grup adı zorunludur';
    } else if (data.name.length < 3) {
      errors.name = 'Grup adı en az 3 karakter olmalıdır';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddGroup = async () => {
    if (!validateForm(formData)) return;

    try {
      setSubmitting(true);
      await apiClient.post('/groups', formData);
      toast.success('Grup başarıyla eklendi');
      setShowAddModal(false);
      resetForm();
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Grup eklenirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditGroup = async () => {
    if (!selectedGroup || !validateForm(formData)) return;

    try {
      setSubmitting(true);
      await apiClient.patch(`/groups/${selectedGroup.id}`, formData);
      toast.success('Grup başarıyla güncellendi');
      setShowEditModal(false);
      resetForm();
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Grup güncellenirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      setSubmitting(true);
      await apiClient.delete(`/groups/${selectedGroup.id}`);
      toast.success('Grup başarıyla silindi');
      setShowDeleteDialog(false);
      setSelectedGroup(null);
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Grup silinirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroup || !selectedUserId) {
      toast.error('Lütfen bir kullanıcı seçiniz');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post(`/groups/${selectedGroup.id}/members`, {
        userId: Number(selectedUserId),
      });
      toast.success('Kullanıcı gruba eklendi');
      setShowAddMemberModal(false);
      setSelectedUserId('');
      
      // Refresh group details
      const updatedGroup = await fetchGroupDetails(selectedGroup.id);
      if (updatedGroup) {
        setSelectedGroup(updatedGroup);
        // Update in groups list
        setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kullanıcı eklenirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedGroup || !selectedUser) return;

    try {
      setSubmitting(true);
      await apiClient.delete(`/groups/${selectedGroup.id}/members/${selectedUser.id}`);
      toast.success('Kullanıcı gruptan çıkarıldı');
      setShowRemoveMemberDialog(false);
      setSelectedUser(null);
      
      // Refresh group details
      const updatedGroup = await fetchGroupDetails(selectedGroup.id);
      if (updatedGroup) {
        setSelectedGroup(updatedGroup);
        // Update in groups list
        setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Kullanıcı çıkarılırken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (group: Group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (group: Group) => {
    setSelectedGroup(group);
    setShowDeleteDialog(true);
  };

  const openMembersModal = async (group: Group) => {
    const groupWithMembers = await fetchGroupDetails(group.id);
    if (groupWithMembers) {
      setSelectedGroup(groupWithMembers);
      setShowMembersModal(true);
    }
  };

  const openAddMemberModal = () => {
    setSelectedUserId('');
    setShowAddMemberModal(true);
  };

  const openRemoveMemberDialog = (user: User) => {
    setSelectedUser(user);
    setShowRemoveMemberDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setFormErrors({});
    setSelectedGroup(null);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const toggleExpandGroup = async (groupId: number) => {
    if (expandedGroupId === groupId) {
      setExpandedGroupId(null);
    } else {
      setExpandedGroupId(groupId);
      // Fetch group details if not already loaded
      const group = groups.find(g => g.id === groupId);
      if (group && !group.members) {
        const groupWithMembers = await fetchGroupDetails(groupId);
        if (groupWithMembers) {
          setGroups(groups.map(g => g.id === groupId ? groupWithMembers : g));
        }
      }
    }
  };

  const getAvailableUsers = () => {
    if (!selectedGroup?.members) return allUsers;
    const memberIds = selectedGroup.members.map(m => m.id);
    return allUsers.filter(u => !memberIds.includes(u.id));
  };

  if (loading && groups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <LoadingSpinner text="Gruplar yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Grup Yönetimi</h1>
          {isAdmin() && (
            <Button onClick={openAddModal}>
              <Plus className="w-5 h-5 mr-2" />
              Yeni Grup
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Grup adı ile ara..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      {groups.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Grup Bulunamadı"
          description="Henüz hiç grup eklenmemiş veya arama kriterlerinize uygun grup bulunamadı."
          actionLabel={isAdmin() ? 'Yeni Grup Ekle' : undefined}
          onAction={isAdmin() ? openAddModal : undefined}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <TableHead>
                <TableRow>
                  <TableHeader className="w-12"> </TableHeader>
                  <TableHeader>Grup Adı</TableHeader>
                  <TableHeader>Açıklama</TableHeader>
                  <TableHeader>Üye Sayısı</TableHeader>
                  {isAdmin() && <TableHeader className="text-right">İşlemler</TableHeader>}
                </TableRow>
              </TableHead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groups.map((group) => (
                  <>
                    <TableRow key={group.id}>
                      <TableCell>
                        <button
                          onClick={() => toggleExpandGroup(group.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {expandedGroupId === group.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {group.description || <span className="text-gray-400">-</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="info">
                          {group._count?.members || group.members?.length || 0} Üye
                        </Badge>
                      </TableCell>
                      {isAdmin() && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openMembersModal(group)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Üyeleri Görüntüle"
                            >
                              <UsersIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(group)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteDialog(group)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                    {/* Expanded Members Row */}
                    {expandedGroupId === group.id && (
                      <tr>
                        <td colSpan={isAdmin() ? 5 : 4} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900">Üyeler</h4>
                              {isAdmin() && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedGroup(group);
                                    openAddMemberModal();
                                  }}
                                >
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Üye Ekle
                                </Button>
                              )}
                            </div>
                            {group.members && group.members.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {group.members.map((member) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                                  >
                                    <div>
                                      <p className="font-medium text-gray-900">{member.fullName}</p>
                                      <p className="text-sm text-gray-600">{member.email}</p>
                                    </div>
                                    {isAdmin() && (
                                      <button
                                        onClick={() => {
                                          setSelectedGroup(group);
                                          openRemoveMemberDialog(member);
                                        }}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Gruptan Çıkar"
                                      >
                                        <UserMinus className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">Bu grupta henüz üye yok</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Toplam {total} gruptan {(currentPage - 1) * limit + 1}-
                {Math.min(currentPage * limit, total)} arası gösteriliyor
              </p>
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Group Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni Grup Ekle" size="md">
        <div className="space-y-4">
          <Input
            label="Grup Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Grup hakkında kısa bir açıklama..."
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              İptal
            </Button>
            <Button onClick={handleAddGroup} loading={submitting}>
              Grup Ekle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Group Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Grubu Düzenle" size="md">
        <div className="space-y-4">
          <Input
            label="Grup Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Grup hakkında kısa bir açıklama..."
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              İptal
            </Button>
            <Button onClick={handleEditGroup} loading={submitting}>
              Güncelle
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Members Modal */}
      <Modal isOpen={showMembersModal} onClose={() => setShowMembersModal(false)} title={`${selectedGroup?.name} - Üyeler`} size="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Toplam {selectedGroup?.members?.length || 0} üye
            </p>
            {isAdmin() && (
              <Button size="sm" onClick={openAddMemberModal}>
                <UserPlus className="w-4 h-4 mr-2" />
                Üye Ekle
              </Button>
            )}
          </div>
          {selectedGroup?.members && selectedGroup.members.length > 0 ? (
            <div className="space-y-2">
              {selectedGroup.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.fullName}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <Badge variant="info" className="text-xs">
                        {member.role === 'ADMIN' ? 'Yönetici' : member.role === 'ISG_UZMANI' ? 'İSG Uzmanı' : 'Denetçi'}
                      </Badge>
                    </p>
                  </div>
                  {isAdmin() && (
                    <button
                      onClick={() => openRemoveMemberDialog(member)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Gruptan Çıkar"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={UsersIcon}
              title="Üye Yok"
              description="Bu grupta henüz hiç üye bulunmuyor."
              actionLabel={isAdmin() ? 'Üye Ekle' : undefined}
              onAction={isAdmin() ? openAddMemberModal : undefined}
            />
          )}
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} title="Gruba Üye Ekle" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            <strong>{selectedGroup?.name}</strong> grubuna eklemek için bir kullanıcı seçiniz.
          </p>
          <Select
            label="Kullanıcı"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            options={getAvailableUsers().map((u) => ({
              value: u.id,
              label: `${u.fullName} (${u.email})`,
            }))}
            placeholder="Kullanıcı seçiniz"
            required
          />
          {getAvailableUsers().length === 0 && (
            <p className="text-sm text-amber-600">Tüm kullanıcılar bu grupta bulunuyor.</p>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowAddMemberModal(false)}>
              İptal
            </Button>
            <Button onClick={handleAddMember} loading={submitting} disabled={!selectedUserId}>
              Üye Ekle
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Group Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteGroup}
        title="Grubu Sil"
        message={`${selectedGroup?.name} grubunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        cancelText="İptal"
        loading={submitting}
      />

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        isOpen={showRemoveMemberDialog}
        onClose={() => setShowRemoveMemberDialog(false)}
        onConfirm={handleRemoveMember}
        title="Üyeyi Çıkar"
        message={`${selectedUser?.fullName} kullanıcısını ${selectedGroup?.name} grubundan çıkarmak istediğinize emin misiniz?`}
        confirmText="Çıkar"
        cancelText="İptal"
        loading={submitting}
      />
    </div>
  );
}
