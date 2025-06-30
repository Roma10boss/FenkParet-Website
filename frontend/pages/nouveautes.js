import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Nouveautes() {
  const t = (key) => key;
  const language = 'fr';
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Merci! Vous serez notifié(e) des nouveaux produits');
      setEmail('');
    } catch (error) {
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Nouveautés | Fenkparet</title>
        <meta name="description" content="Découvrez nos dernières nouveautés et produits récents" />
      </Head>

      <div className="min-h-screen bg-theme-primary py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl lg:text-5xl font-bold text-theme-primary mb-4">
              {language === 'fr' ? 'Nouveautés' : 'New Arrivals'}
            </h1>
            <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
              {language === 'fr' ? 
                'Découvrez nos derniers produits et les dernières tendances.' :
                'Discover our latest products and newest trends.'
              }
            </p>
          </div>

          {/* Coming Soon Section */}
          <div className="card-accent p-12 text-center animate-fade-in-scale">
            <div className="feature-icon-large mx-auto mb-6">
              <span className="text-3xl">🆕</span>
            </div>
            <h2 className="text-2xl font-bold text-theme-primary mb-4">
              {language === 'fr' ? 'Bientôt disponible' : 'Coming Soon'}
            </h2>
            <p className="text-theme-secondary mb-8">
              {language === 'fr' ? 
                'Nous préparons de nouveaux produits incroyables pour vous. Restez connectés!' :
                'We are preparing amazing new products for you. Stay tuned!'
              }
            </p>
            
            {/* Email Notification Form */}
            <form onSubmit={handleNotifySubmit} className="max-w-md mx-auto mb-8">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className="btn-primary px-6 whitespace-nowrap"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi...' : 'Notifiez-moi'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Soyez le premier à découvrir nos nouveaux produits
              </p>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn-secondary">
                {language === 'fr' ? 'Voir tous les produits' : 'View All Products'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}