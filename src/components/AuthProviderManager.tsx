import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    AlertCircle,
    CheckCircle,
    Facebook,
    Github,
    Chrome as Google,
    Link,
    Twitter,
    Unlink
} from "lucide-react";
import { useState } from "react";

const providerIcons = {
  github: Github,
  google: Google,
  facebook: Facebook,
  twitter: Twitter,
};

const providerNames = {
  github: 'GitHub',
  google: 'Google',
  facebook: 'Facebook',
  twitter: 'Twitter',
};

interface AuthProviderManagerProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AuthProviderManager = ({ isOpen, onOpenChange }: AuthProviderManagerProps) => {
  const { user, providers, linkProvider, unlinkProvider, signInWithOAuth } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setErrorSuccess] = useState<string | null>(null);

  const availableProviders = ['github', 'google', 'facebook', 'twitter'] as const;

  const getProviderIcon = (provider: string) => {
    const IconComponent = providerIcons[provider as keyof typeof providerIcons];
    return IconComponent || Link;
  };

  const handleLinkProvider = async (provider: typeof availableProviders[number]) => {
    setLoading(provider);
    setError(null);
    setErrorSuccess(null);

    try {
      const result = await linkProvider(provider);
      if (result.error) {
        throw result.error;
      }
      setErrorSuccess(`${t("successfullyLinkedProvider")} ${providerNames[provider]}`);
    } catch (err: any) {
      setError(err.message || `${t("failedToLinkProvider")} ${providerNames[provider]}`);
    } finally {
      setLoading(null);
    }
  };

  const handleUnlinkProvider = async (providerId: string, providerName: string) => {
    setLoading(providerId);
    setError(null);
    setErrorSuccess(null);

    try {
      await unlinkProvider(providerId);
      setErrorSuccess(`${t("successfullyUnlinkedProvider")} ${providerName}`);
    } catch (err: any) {
      setError(err.message || `${t("failedToUnlinkProvider")} ${providerName}`);
    } finally {
      setLoading(null);
    }
  };

  const handleSignInWithProvider = async (provider: typeof availableProviders[number]) => {
    setLoading(provider);
    setError(null);
    setErrorSuccess(null);

    try {
      await signInWithOAuth(provider);
    } catch (err: any) {
      setError(err.message || `${t("failedToSignInWithProvider")} ${providerNames[provider]}`);
      setLoading(null);
    }
  };

  const isProviderLinked = (provider: string) => {
    return providers.some(p => p.provider === provider);
  };

//   const getLinkedProvider = (provider: string) => {
//     return providers.find(p => p.provider === provider);
//   };

  const content = (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{t("authenticationProviders")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("manageYourConnectedAccounts")}
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Providers */}
      <div className="space-y-4">
        <h4 className="font-medium">{t("connectedAccounts")}</h4>
        {providers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noConnectedAccounts")}</p>
        ) : (
          <div className="space-y-3">
            {providers.map((provider) => {
              const IconComponent = getProviderIcon(provider.provider);
              const providerName = providerNames[provider.provider as keyof typeof providerNames] || provider.provider;
              
              return (
                <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{providerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("connectedOn")} {new Date(provider.created_at||'').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{t("connected")}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlinkProvider(provider.id, providerName)}
                      disabled={loading === provider.id || providers.length <= 1}
                    >
                      {loading === provider.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Unlink className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Providers */}
      <div className="space-y-4">
        <h4 className="font-medium">{t("availableProviders")}</h4>
        <div className="grid gap-2">
          {availableProviders.map((provider) => {
            const IconComponent = getProviderIcon(provider);
            const providerName = providerNames[provider];
            const isLinked = isProviderLinked(provider);
            // const linkedProvider = getLinkedProvider(provider);

            if (isLinked) return null;

            return (
              <Button
                key={provider}
                variant="outline"
                className="justify-start"
                onClick={() => user ? handleLinkProvider(provider) : handleSignInWithProvider(provider)}
                disabled={loading === provider}
              >
                {loading === provider ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <IconComponent className="h-4 w-4 mr-2" />
                )}
                {user ? `${t("connectProvider")} ${providerName}` : `${t("signInWithProvider")} ${providerName}`}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {t("authProviderDisclaimer")}
      </div>
    </div>
  );

  if (isOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("manageAuthenticationProviders")}</DialogTitle>
            <DialogDescription>
              {t("manageYourConnectedAccounts")}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("authenticationProviders")}</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default AuthProviderManager;
