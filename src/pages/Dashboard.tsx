import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MessageSquare, 
  LogOut, 
  Bug, 
  Lightbulb, 
  ThumbsUp, 
  HelpCircle,
  Key,
  Filter,
  Inbox
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type FeedbackType = 'bug' | 'suggestion' | 'praise' | 'other';

interface Feedback {
  id: string;
  type: FeedbackType;
  message: string;
  external_user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface Profile {
  company_name: string;
}

const typeConfig: Record<FeedbackType, { label: string; icon: React.ReactNode; color: string }> = {
  bug: { 
    label: 'Bug', 
    icon: <Bug className="h-3.5 w-3.5" />, 
    color: 'bg-destructive/10 text-destructive border-destructive/20' 
  },
  suggestion: { 
    label: 'Sugestão', 
    icon: <Lightbulb className="h-3.5 w-3.5" />, 
    color: 'bg-warning/10 text-warning border-warning/20' 
  },
  praise: { 
    label: 'Elogio', 
    icon: <ThumbsUp className="h-3.5 w-3.5" />, 
    color: 'bg-success/10 text-success border-success/20' 
  },
  other: { 
    label: 'Outro', 
    icon: <HelpCircle className="h-3.5 w-3.5" />, 
    color: 'bg-info/10 text-info border-info/20' 
  }
};

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const [feedbacksRes, profileRes] = await Promise.all([
      supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('company_name')
        .eq('id', user.id)
        .single()
    ]);

    if (feedbacksRes.data) {
      setFeedbacks(feedbacksRes.data as Feedback[]);
    }
    if (profileRes.data) {
      setProfile(profileRes.data);
    }
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const filteredFeedbacks = typeFilter === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.type === typeFilter);

  const feedbackCounts = feedbacks.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Echofy</h1>
              {profile && (
                <p className="text-sm text-muted-foreground">{profile.company_name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/settings')}
            >
              <Key className="h-4 w-4" />
              API Key
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(['bug', 'suggestion', 'praise', 'other'] as FeedbackType[]).map((type) => (
            <Card key={type} className="border-border/50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${typeConfig[type].color}`}>
                    {typeConfig[type].icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {feedbackCounts[type] || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {typeConfig[type].label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feedbacks List */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Feedbacks</CardTitle>
              <CardDescription>
                {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} recebido{feedbacks.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="bug">Bugs</SelectItem>
                  <SelectItem value="suggestion">Sugestões</SelectItem>
                  <SelectItem value="praise">Elogios</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {typeFilter === 'all' 
                    ? 'Nenhum feedback recebido ainda' 
                    : 'Nenhum feedback deste tipo'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Integre a API para começar a receber feedbacks
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <div 
                    key={feedback.id} 
                    className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors animate-fade-in"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${typeConfig[feedback.type].color}`}>
                        {typeConfig[feedback.type].icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={typeConfig[feedback.type].color}>
                            {typeConfig[feedback.type].label}
                          </Badge>
                          {feedback.external_user_id && (
                            <span className="text-xs text-muted-foreground">
                              User: {feedback.external_user_id}
                            </span>
                          )}
                        </div>
                        <p className="text-foreground">{feedback.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(feedback.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                        {feedback.metadata && Object.keys(feedback.metadata).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(feedback.metadata).map(([key, value]) => (
                              <span 
                                key={key} 
                                className="text-xs px-2 py-0.5 bg-muted rounded text-muted-foreground"
                              >
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
