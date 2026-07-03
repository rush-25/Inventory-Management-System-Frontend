import { useState } from 'react';
import { useAppContext, Supplier } from '../store/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const supplierSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  contactNumber: z.string().min(5, 'Contact number is required'),
  email: z.string().email('Valid email is required'),
  address: z.string().min(5, 'Address is required'),
  status: z.enum(['Active', 'Inactive'])
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useAppContext();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useReactHookForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { status: 'Active' }
  });

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    reset({ name: '', contactNumber: '', email: '', address: '', status: 'Active' });
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setValue('name', supplier.name);
    setValue('contactNumber', supplier.contactNumber);
    setValue('email', supplier.email);
    setValue('address', supplier.address);
    setValue('status', supplier.status);
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data);
        toast.success('Supplier updated successfully');
      } else {
        await addSupplier(data);
        toast.success('Supplier added successfully');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save supplier');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        toast.success('Supplier deleted successfully');
      } catch (err: any) {
        toast.error(err?.message ?? 'Failed to delete supplier');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-slate-500 mt-1">Manage vendor details and contacts.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-5 w-5 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search suppliers..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-900 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Supplier Name</th>
                  <th className="px-6 py-4">Contact Number</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{supplier.name}</td>
                    <td className="px-6 py-4">{supplier.contactNumber}</td>
                    <td className="px-6 py-4">{supplier.email}</td>
                    <td className="px-6 py-4 truncate max-w-[200px]">{supplier.address}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        supplier.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEditModal(supplier)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(supplier.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No suppliers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Supplier Name" {...register('name')} error={errors.name?.message} />
          <Input label="Phone Number" {...register('contactNumber')} error={errors.contactNumber?.message} />
          <Input type="email" label="Email Address" {...register('email')} error={errors.email?.message} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <textarea
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
              {...register('address')}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>
          <Select
            label="Status"
            options={[{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }]}
            {...register('status')}
            error={errors.status?.message}
          />
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Supplier</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
