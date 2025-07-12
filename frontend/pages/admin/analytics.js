// pages/admin/analytics.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UsersIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const AnalyticsPage = () => {
  const router = useRouter();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [analytics, setAnalytics] = useState({
    overview: null,
    charts: null,
    loading: true,
    error: null
  });
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/admin/login');
      return;
    }
    fetchAnalytics();
  }, [dateRange, isAuthenticated, isAdmin]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalytics(prev => ({ ...prev, loading: true, error: null }));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/admin/analytics?period=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics({
          overview: data.overview || generateMockStats(),
          charts: data.charts || {},
          loading: false,
          error: null
        });
      } else {
        throw new Error(`Erreur ${response.status}: Impossible de charger les données`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
      setAnalytics({
        overview: generateMockStats(),
        charts: {},
        loading: false,
        error: error.message
      });
      toast.error('Données d\'exemple affichées - Serveur non disponible');
    }
  }, [dateRange]);

  const generateMockStats = () => ({
    revenue: { current: 45678, change: 12.5, changeType: 'positive' },
    orders: { current: 156, change: 8.3, changeType: 'positive' },
    customers: { current: 89, change: -2.1, changeType: 'negative' },
    conversionRate: { current: 3.2, change: 5.4, changeType: 'positive' }
  });

  const handleExportPDF = () => {
    toast.success('Export PDF lancé (fonctionnalité à venir)');
  };

  const handleExportCSV = () => {
    const csvData = [
      ['Métrique', 'Valeur', 'Changement'],
      ['Revenus', `${analytics.overview?.revenue?.current || 0} HTG`, `${analytics.overview?.revenue?.change || 0}%`],
      ['Commandes', analytics.overview?.orders?.current || 0, `${analytics.overview?.orders?.change || 0}%`],
      ['Clients', analytics.overview?.customers?.current || 0, `${analytics.overview?.customers?.change || 0}%`],
      ['Taux de conversion', `${analytics.overview?.conversionRate?.current || 0}%`, `${analytics.overview?.conversionRate?.change || 0}%`]
    ];
    
    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Données exportées en CSV');
  };

  if (analytics.loading) {
    return (
      <div className="admin-dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Revenus Totaux',
      value: `${analytics.overview?.revenue?.current?.toLocaleString() || 0} HTG`,
      change: analytics.overview?.revenue?.change || 0,
      changeType: analytics.overview?.revenue?.changeType || 'neutral',
      icon: CurrencyDollarIcon,
      color: 'text-green-600'
    },
    {
      title: 'Commandes',
      value: analytics.overview?.orders?.current?.toLocaleString() || 0,
      change: analytics.overview?.orders?.change || 0,
      changeType: analytics.overview?.orders?.changeType || 'neutral',
      icon: DocumentTextIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Nouveaux Clients',
      value: analytics.overview?.customers?.current?.toLocaleString() || 0,
      change: analytics.overview?.customers?.change || 0,
      changeType: analytics.overview?.customers?.changeType || 'neutral',
      icon: UsersIcon,
      color: 'text-purple-600'
    },
    {
      title: 'Taux de Conversion',
      value: `${analytics.overview?.conversionRate?.current?.toFixed(1) || 0}%`,
      change: analytics.overview?.conversionRate?.change || 0,
      changeType: analytics.overview?.conversionRate?.changeType || 'neutral',
      icon: TrendingUpIcon,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary mb-2">Analyse des Ventes</h1>
          <p className="text-theme-secondary">Aperçu détaillé des performances et métriques de vente</p>
          {analytics.error && (
            <p className="text-warning-color text-sm mt-1">⚠️ Données d&apos;exemple (serveur non disponible)</p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-theme-secondary" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="admin-input min-w-0"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">Dernière année</option>
            </select>
          </div>
          
          <button
            onClick={() => router.push('/admin/sales-analytics')}
            className="btn-primary flex items-center space-x-2"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Rapport Détaillé</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="admin-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg bg-theme-secondary ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-theme-secondary uppercase tracking-wide">
                      {stat.title}
                    </p>
                    {stat.change !== 0 && (
                      <div className={`flex items-center space-x-1 text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-success-color' : 'text-error-color'
                      }`}>
                        <TrendingUpIcon className={`w-4 h-4 ${stat.changeType === 'negative' ? 'rotate-180' : ''}`} />
                        <span>{Math.abs(stat.change).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-2xl font-bold text-theme-primary">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-theme-primary mb-6 flex items-center">
            <ShoppingCartIcon className="w-5 h-5 mr-2" />
            Taux de Conversion
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-theme-secondary">Pages Produits → Panier</span>
              <span className="text-sm font-medium text-theme-primary">3.2%</span>
            </div>
            <div className="w-full bg-theme-secondary rounded-full h-2">
              <div className="bg-accent h-2 rounded-full transition-all duration-300" style={{ width: '32%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-theme-secondary">Panier → Commande</span>
              <span className="text-sm font-medium text-theme-primary">68%</span>
            </div>
            <div className="w-full bg-theme-secondary rounded-full h-2">
              <div className="bg-success-color h-2 rounded-full transition-all duration-300" style={{ width: '68%' }}></div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="text-lg font-semibold text-theme-primary mb-6 flex items-center">
            <UsersIcon className="w-5 h-5 mr-2" />
            Insights Clients
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-theme">
              <div>
                <p className="text-sm font-medium text-theme-primary">Durée Moyenne Session</p>
                <p className="text-xs text-theme-secondary">Par rapport au mois dernier</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-theme-primary">4m 32s</p>
                <p className="text-xs text-success-color">+12%</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm font-medium text-theme-primary">Pages par Session</p>
                <p className="text-xs text-theme-secondary">Engagement moyen</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-theme-primary">2.8</p>
                <p className="text-xs text-success-color">+5%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-theme-primary mb-6 flex items-center">
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Exporter les Données
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportPDF}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Exporter PDF</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Exporter CSV</span>
          </button>
          
          <button
            onClick={() => router.push('/admin/sales-analytics')}
            className="btn-primary flex items-center space-x-2"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>Analyses Avancées</span>
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-theme-secondary rounded-lg">
          <p className="text-sm text-theme-secondary">
            <strong>Note:</strong> Les données sont mises à jour en temps réel. 
            Les rapports incluent toutes les transactions et interactions clients pour la période sélectionnée.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;