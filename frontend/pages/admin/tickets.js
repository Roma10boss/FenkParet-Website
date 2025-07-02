// pages/admin/tickets.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAlert } from '../../components/admin/AlertsPanel';
import Card from '../../components/admin/Card';
import TicketModal from '../../components/admin/TicketModal';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    avgResponseTime: 0
  });
  
  const router = useRouter();
  const { showSuccess, showError, showWarning } = useAlert();

  const ticketsPerPage = 15;

  const ticketStatuses = [
    { value: 'open', label: 'Ouvert', color: 'red' },
    { value: 'in_progress', label: 'En cours', color: 'yellow' },
    { value: 'waiting_customer', label: 'En attente client', color: 'blue' },
    { value: 'resolved', label: 'Résolu', color: 'green' },
    { value: 'closed', label: 'Fermé', color: 'gray' }
  ];

  const ticketPriorities = [
    { value: 'low', label: 'Faible', color: 'gray' },
    { value: 'medium', label: 'Moyenne', color: 'yellow' },
    { value: 'high', label: 'Élevée', color: 'orange' },
    { value: 'urgent', label: 'Urgente', color: 'red' }
  ];

  const ticketCategories = [
    { value: 'technical', label: 'Problème technique' },
    { value: 'billing', label: 'Facturation' },
    { value: 'account', label: 'Compte' },
    { value: 'product', label: 'Demande produit' },
    { value: 'shipping', label: 'Livraison' },
    { value: 'return', label: 'Retour/Remboursement' },
    { value: 'other', label: 'Autre' }
  ];

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [fetchTickets, fetchStats]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: ticketsPerPage,
        search: searchTerm,
        status: filterStatus,
        priority: filterPriority,
        category: filterCategory
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/admin/tickets?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets);
      setTotalPages(Math.ceil(data.total / ticketsPerPage));
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showError('Failed to fetch tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, ticketsPerPage, searchTerm, filterStatus, filterPriority, filterCategory, showError]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/admin/tickets/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
    }
  }, []);

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket status');
      }

      showSuccess('Ticket status updated successfully');
      fetchTickets();
      fetchStats();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      showError('Failed to update ticket status. Please try again.');
    }
  };

  const assignTicket = async (ticketId, assigneeId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/admin/tickets/${ticketId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assigneeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign ticket');
      }

      showSuccess('Ticket assigned successfully');
      fetchTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      showError('Failed to assign ticket. Please try again.');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedTickets.length === 0) {
      showWarning('Veuillez sélectionner des tickets pour effectuer une action groupée');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/admin/tickets/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketIds: selectedTickets,
          action: action
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to perform bulk ${action}`);
      }

      const actionLabels = {
        'close': 'fermeture',
        'assign': 'assignation',
        'priority_high': 'priorité élevée',
        'priority_low': 'priorité faible'
      };

      showSuccess(`${actionLabels[action] || action} groupée terminée avec succès`);
      setSelectedTickets([]);
      fetchTickets();
      fetchStats();
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      showError(`Échec de l&apos;action groupée ${actionLabels[action] || action}. Veuillez réessayer.`);
    }
  };

  // Auto-close resolved tickets after 7 days
  const autoCloseResolvedTickets = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/admin/tickets/auto-close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daysAfterResolved: 7
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to auto-close tickets');
      }

      const data = await response.json();
      if (data.closedCount > 0) {
        showSuccess(`${data.closedCount} tickets résolus fermés automatiquement`);
        fetchTickets();
        fetchStats();
      }
    } catch (error) {
      console.error('Error auto-closing tickets:', error);
    }
  };

  const handleSelectTicket = (ticketId) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map(ticket => ticket.id));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = ticketStatuses.find(s => s.value === status);
    if (!statusConfig) return null;

    const colorClasses = {
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      gray: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[statusConfig.color]}`}>
        {statusConfig.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = ticketPriorities.find(p => p.value === priority);
    if (!priorityConfig) return null;

    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[priorityConfig.color]}`}>
        {priorityConfig.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (hours) => {
    if (hours < 24) {
      return `${Math.round(hours)}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return `${days}d ${remainingHours}h`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600">Manage customer support requests and inquiries</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={autoCloseResolvedTickets}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Fermeture automatique
            </button>
            <button
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/admin/tickets/export`, '_blank')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Exporter les tickets
            </button>
            <button
              onClick={() => {
                setSelectedTicket(null);
                setShowTicketModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un ticket
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.open}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-semibold text-gray-900">{formatDuration(stats.avgResponseTime)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {ticketStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                {ticketPriorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {ticketCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Actions */}
            <div>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setFilterStatus(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Quick Filters</option>
                <option value="open">Open Tickets</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedTickets.length > 0 && (
          <Card className="bg-blue-50 p-4 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedTickets.length} ticket(s) selected
              </span>
              <div className="space-x-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAction(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="text-sm border border-blue-300 rounded px-2 py-1"
                >
                  <option value="">Actions groupées</option>
                  <option value="close">Fermer les tickets</option>
                  <option value="assign">M&apos;assigner</option>
                  <option value="priority_high">Priorité élevée</option>
                  <option value="priority_low">Priorité faible</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Tickets Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedTickets.length === tickets.length && tickets.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket.id)}
                        onChange={() => handleSelectTicket(ticket.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{ticket.ticketNumber}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{ticket.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ticket.customer.name}</div>
                        <div className="text-sm text-gray-500">{ticket.customer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {ticketCategories.find(c => c.value === ticket.category)?.label || ticket.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={ticket.status}
                        onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {ticketStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ticket.assignee ? (
                          <span className="text-blue-600">{ticket.assignee.name}</span>
                        ) : (
                          <button
                            onClick={() => assignTicket(ticket.id, 'current-admin-id')}
                            className="text-gray-400 hover:text-blue-600 text-xs"
                          >
                            Assign to me
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowTicketModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Résoudre
                      </button>
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'closed')}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Fermer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {tickets.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
              <p className="mt-1 text-sm text-gray-500">All caught up! No support tickets at the moment.</p>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {/* Pagination */}
        {/* Pagination */}
        {/* Pagination removed for debugging */}

        {/* Ticket Details Modal - Use your existing implementation */}
        {showTicketModal && selectedTicket && (
          <TicketModal
            ticket={selectedTicket}
            onClose={() => setShowTicketModal(false)}
            onStatusUpdate={(newStatus) => {
              updateTicketStatus(selectedTicket.id, newStatus);
              setShowTicketModal(false);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default TicketsPage;

