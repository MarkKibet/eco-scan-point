import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserRecord {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  total_points: number;
  created_at: string;
  role: string;
  household_code: string | null;
}

interface AdminUserManagementProps {
  user: UserRecord;
  onUpdated: () => void;
}

export function AdminEditButton({ user, onUpdated }: AdminUserManagementProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    location: user.location || '',
    household_code: user.household_code || '',
    total_points: user.total_points || 0,
  });

  const handleOpen = () => {
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      location: user.location || '',
      household_code: user.household_code || '',
      total_points: user.total_points || 0,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        location: form.location.trim() || null,
        household_code: form.household_code.trim() || null,
        total_points: form.total_points,
      })
      .eq('id', user.id);

    setSaving(false);
    if (error) {
      console.error('Update error:', error);
      toast.error('Failed to update user');
    } else {
      toast.success(`${user.name} updated successfully`);
      setOpen(false);
      onUpdated();
    }
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpen(); }}>
        <Pencil className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit {user.role === 'household' ? 'Household' : user.role === 'collector' ? 'Collector' : 'Receiver'}</DialogTitle>
            <DialogDescription>Update details for {user.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input id="edit-location" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            {user.role === 'household' && (
              <>
                <div>
                  <Label htmlFor="edit-hcode">Household ID</Label>
                  <Input id="edit-hcode" value={form.household_code} onChange={(e) => setForm(f => ({ ...f, household_code: e.target.value }))} placeholder="e.g. HazinaEstate/001" />
                </div>
                <div>
                  <Label htmlFor="edit-points">Total Points</Label>
                  <Input id="edit-points" type="number" value={form.total_points} onChange={(e) => setForm(f => ({ ...f, total_points: parseInt(e.target.value) || 0 }))} />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AdminDeleteButton({ user, onUpdated }: AdminUserManagementProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    // Delete in order: bag_reviews -> bags -> user_roles -> profiles
    // First delete bag reviews where this user is collector
    await supabase.from('bag_reviews').delete().eq('collector_id', user.id);
    
    // Delete bags belonging to this household
    await supabase.from('bags').delete().eq('household_id', user.id);

    // Delete user role
    await supabase.from('user_roles').delete().eq('user_id', user.id);

    // Delete profile
    const { error } = await supabase.from('profiles').delete().eq('id', user.id);

    setDeleting(false);
    if (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove user');
    } else {
      toast.success(`${user.name} has been removed`);
      setOpen(false);
      onUpdated();
    }
  };

  return (
    <>
      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setOpen(true); }}>
        <Trash2 className="w-4 h-4" />
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to remove {user.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {user.role}'s profile, their associated bags, reviews, and role assignment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Removing...' : 'Yes, Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
