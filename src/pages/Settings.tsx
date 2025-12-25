import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  ArrowLeft, 
  Key, 
  Copy, 
  Check,
  RefreshCw,
  Code
} from 'lucide-react';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchApiKey();
    }
  }, [user]);

  const fetchApiKey = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (data) {
      setApiKey(data);
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    if (!apiKey) return;
    
    await navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    toast({
      title: 'Copiado!',
      description: 'API Key copiada para a área de transferência'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateKey = async () => {
    if (!user || !apiKey) return;
    
    setRegenerating(true);
    
    // Deactivate old key
    await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', apiKey.id);

    // Create new key
    const { data, error } = await supabase
      .from('api_keys')
      .insert({ user_id: user.id, name: 'Default API Key' })
      .select()
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível regenerar a API Key'
      });
    } else if (data) {
      setApiKey(data);
      toast({
        title: 'Nova API Key gerada',
        description: 'Lembre-se de atualizar suas integrações'
      });
    }
    
    setRegenerating(false);
  };

  const apiEndpoint = `${window.location.origin.replace('localhost:8080', 'sdiphhkaoifgfgvgbjwh.supabase.co')}/functions/v1/feedbacks`;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-foreground">Configurações</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* API Key Card */}
        <Card className="border-border/50 mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>API Key</CardTitle>
            </div>
            <CardDescription>
              Use esta chave para autenticar suas requisições à API de feedbacks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="h-10 bg-muted animate-pulse rounded-lg" />
            ) : apiKey ? (
              <>
                <div className="flex gap-2">
                  <Input 
                    value={apiKey.key} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={regenerateKey}
                  disabled={regenerating}
                >
                  <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                  Regenerar API Key
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Nenhuma API Key encontrada</p>
            )}
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <CardTitle>Documentação da API</CardTitle>
            </div>
            <CardDescription>
              Como integrar a API de feedbacks no seu produto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Endpoint</h3>
              <code className="block p-3 bg-muted rounded-lg text-sm font-mono break-all">
                POST {apiEndpoint}
              </code>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Headers</h3>
              <code className="block p-3 bg-muted rounded-lg text-sm font-mono">
                Authorization: Bearer YOUR_API_KEY<br />
                Content-Type: application/json
              </code>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Body</h3>
              <pre className="p-3 bg-muted rounded-lg text-sm font-mono overflow-x-auto">
{`{
  "userId": "user-123",       // opcional
  "type": "bug",              // bug | suggestion | praise | other
  "message": "Texto do feedback",
  "metadata": {               // opcional
    "page": "/dashboard",
    "device": "mobile",
    "appVersion": "1.0.0"
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Exemplo com cURL</h3>
              <pre className="p-3 bg-muted rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap">
{`curl -X POST "${apiEndpoint}" \\
  -H "Authorization: Bearer ${apiKey?.key || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{"type": "suggestion", "message": "Gostaria de mais opções de filtro"}'`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Exemplo com JavaScript</h3>
              <pre className="p-3 bg-muted rounded-lg text-sm font-mono overflow-x-auto">
{`await fetch("${apiEndpoint}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${apiKey?.key || 'YOUR_API_KEY'}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    type: "bug",
    message: "Botão não funciona no Safari",
    metadata: { page: "/checkout", device: "desktop" }
  })
});`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
