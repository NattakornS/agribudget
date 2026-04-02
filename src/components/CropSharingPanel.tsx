import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getSharesForCrop,
  inviteUserToCrop,
  revokeShare,
} from '@/services/cropShareService';
import type { CropShare } from '@/types';
import { Loader2, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CropSharingPanelProps {
  cropId: string;
  cropName: string;
}

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  accepted: 'default',
  rejected: 'destructive',
};

const CropSharingPanel = ({ cropId, cropName }: CropSharingPanelProps) => {
  const [shares, setShares] = useState<CropShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadShares = async () => {
    try {
      const data = await getSharesForCrop(cropId);
      setShares(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
  }, [cropId]);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setError(null);
    setSuccess(null);
    setInviting(true);
    try {
      await inviteUserToCrop(cropId, email.trim());
      setEmail('');
      setSuccess(`Invitation sent to ${email.trim()}`);
      await loadShares();
    } catch (err: any) {
      if (err.code === '23505') {
        setError('This email has already been invited to this crop.');
      } else {
        setError(err.message);
      }
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (shareId: string) => {
    setRevoking(shareId);
    setError(null);
    try {
      await revokeShare(shareId);
      setShares((prev) => prev.filter((s) => s.id !== shareId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Share <strong>{cropName}</strong> with another user by email. They will be able to view and add income/expense records for this crop.
      </p>

      {/* Invite form */}
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          disabled={inviting}
        />
        <Button onClick={handleInvite} disabled={inviting || !email.trim()} size="sm">
          {inviting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      {/* Shares list */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : shares.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No shares yet. Invite someone above.
        </p>
      ) : (
        <div className="space-y-2">
          {shares.map((share) => (
            <div
              key={share.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-medium truncate">{share.invitee_email}</span>
                <Badge variant={statusVariant[share.status] ?? 'secondary'}>
                  {statusLabel[share.status] ?? share.status}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0 text-destructive hover:text-destructive"
                onClick={() => handleRevoke(share.id)}
                disabled={revoking === share.id}
                title="Revoke access"
              >
                {revoking === share.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropSharingPanel;
