import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCropFilter } from '@/contexts/CropFilterContext';
import { getPendingInvitations, respondToInvitation } from '@/services/cropShareService';
import type { CropShare } from '@/types';
import { Check, Loader2, Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const InvitationsPanel = () => {
  const [invitations, setInvitations] = useState<CropShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { refreshCrops } = useCropFilter();

  const loadInvitations = async () => {
    try {
      const data = await getPendingInvitations();
      setInvitations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleRespond = async (shareId: string, accept: boolean) => {
    setResponding(shareId);
    setError(null);
    try {
      await respondToInvitation(shareId, accept);
      setInvitations((prev) => prev.filter((inv) => inv.id !== shareId));
      if (accept) {
        await refreshCrops();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Share2 className="h-5 w-5 text-primary" />
          Pending Invitations ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {inv.crops?.name ?? 'Unknown crop'}
              </p>
              <p className="text-xs text-muted-foreground">
                You have been invited to access this crop
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => handleRespond(inv.id, false)}
                disabled={responding === inv.id}
                title="Reject"
              >
                {responding === inv.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleRespond(inv.id, true)}
                disabled={responding === inv.id}
                title="Accept"
              >
                {responding === inv.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InvitationsPanel;
