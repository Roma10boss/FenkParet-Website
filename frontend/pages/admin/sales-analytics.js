// pages/admin/sales-analytics.js
import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';

const AdminSalesAnalyticsPage = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-theme-primary mb-6">Analyse des Ventes</h1>
        <Card title="Statistiques de Ventes">
          <p className="text-theme-secondary">Page d&apos;analyse des ventes en développement. Contenu à venir bientôt!</p>
          {/* You'll display sales charts, reports, etc., here */}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSalesAnalyticsPage;
