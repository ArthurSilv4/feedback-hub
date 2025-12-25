import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  ArrowRight, 
  Zap, 
  BarChart3, 
  Shield,
  Code
} from 'lucide-react';

const features = [
  {
    icon: <Code className="h-5 w-5" />,
    title: 'API Simples',
    description: 'Uma única API REST para coletar feedbacks de qualquer aplicação'
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Dashboard Intuitivo',
    description: 'Visualize e filtre todos os feedbacks em um só lugar'
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Seguro por Padrão',
    description: 'API Keys exclusivas para cada empresa, dados isolados'
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Fácil Integração',
    description: 'Integre em minutos com documentação clara e exemplos'
  }
];

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Echofy</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Entrar
            </Button>
            <Button variant="gradient" onClick={() => navigate('/auth')}>
              Começar grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Zap className="h-3.5 w-3.5" />
            Centralize feedbacks em minutos
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
            Colete feedbacks dos seus usuários em um só lugar
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Uma API simples para receber bugs, sugestões e elogios. Um dashboard limpo para visualizar tudo.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              variant="gradient" 
              size="xl"
              onClick={() => navigate('/auth')}
            >
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => navigate('/auth')}
            >
              Ver demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            Tudo que você precisa para coletar feedbacks
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Pronto para começar?
          </h2>
          <p className="text-muted-foreground mb-8">
            Crie sua conta em segundos e comece a coletar feedbacks hoje mesmo.
          </p>
          <Button 
            variant="gradient" 
            size="xl"
            onClick={() => navigate('/auth')}
          >
            Começar agora
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>Echofy © 2025</span>
        </div>
      </footer>
    </div>
  );
}
