// components/admin/QuickActions.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  DocumentArrowDownIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentChartBarIcon,
  CircleStackIcon,
  CubeIcon,
  DocumentTextIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const ActionButton = ({ title, icon: Icon, onClick, loading, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled || loading}
    className="admin-button w-full flex items-center justify-center p-4 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-105 transition-all duration-200"
  >
    <div className="mr-3">
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : (
        <span className="text-lg">📊</span>
      )}
    </div>
    <div className="font-medium">{loading ? 'Chargement...' : title}</div>
  </button>
);

const QuickActions = () => {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState(null);

  const handleAction = async (actionType, path = null) => {
    setLoadingAction(actionType);
    
    try {
      if (path) {
        router.push(path);
        return;
      } else {
        // Simulate async action for non-navigation actions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        switch (actionType) {
          case 'export':
            console.log('Exporting data...');
            // Here you would implement actual export functionality
            break;
          case 'newsletter':
            console.log('Sending newsletter...');
            // Here you would implement newsletter functionality
            break;
          case 'sync':
            console.log('Syncing inventory...');
            // Here you would implement sync functionality
            break;
          case 'cache':
            console.log('Clearing cache...');
            // Here you would implement cache clearing
            break;
          case 'reports':
            console.log('Generating reports...');
            // Here you would implement report generation
            break;
          case 'backup':
            console.log('Backing up database...');
            // Here you would implement backup functionality
            break;
          default:
            console.log('Action:', actionType);
        }
      }
    } catch (error) {
      console.error('Erreur d\'action:', error);
    } finally {
      setTimeout(() => setLoadingAction(null), 1000);
    }
  };

  const actions = [
    { 
      title: 'Gérer les produits', 
      icon: CubeIcon, 
      onClick: () => handleAction('products', '/admin/products'),
      type: 'products'
    },
    { 
      title: 'Voir les commandes', 
      icon: DocumentTextIcon, 
      onClick: () => handleAction('orders', '/admin/orders'),
      type: 'orders'
    },
    { 
      title: 'Gérer les utilisateurs', 
      icon: UsersIcon, 
      onClick: () => handleAction('users', '/admin/users'),
      type: 'users'
    },
    { 
      title: 'Tickets de support', 
      icon: ChatBubbleLeftRightIcon, 
      onClick: () => handleAction('tickets', '/admin/tickets'),
      type: 'tickets'
    },
    { 
      title: 'Exporter les données', 
      icon: DocumentArrowDownIcon, 
      onClick: () => handleAction('export'),
      type: 'export'
    },
    { 
      title: 'Générer des rapports', 
      icon: DocumentChartBarIcon, 
      onClick: () => handleAction('reports'),
      type: 'reports'
    },
  ];

  return (
    <div className="admin-card">
      <h3 className="text-xl font-semibold mb-6 text-theme-primary">Actions rapides</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <ActionButton 
            key={index} 
            {...action} 
            loading={loadingAction === action.type}
            disabled={loadingAction && loadingAction !== action.type}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;