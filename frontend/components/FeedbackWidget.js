import { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftEllipsisIcon, 
  XMarkIcon,
  PaperAirplaneIcon,
  StarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { api } from '../utils/api-config';
import { toast } from 'react-hot-toast';

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [feedback, setFeedback] = useState({
    type: 'general',
    message: '',
    email: '',
    rating: 5,
    hoverRating: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerStats, setCustomerStats] = useState({
    totalRatings: 0,
    averageRating: 4.7,
    visitorCount: 1000,
    ratingDistribution: [2, 3, 8, 35, 52] // 1-5 stars percentages
  });

  useEffect(() => {
    // Load existing feedback data and update stats
    const loadCustomerStats = () => {
      const existingFeedback = JSON.parse(localStorage.getItem('customerFeedback') || '[]');
      const currentVisitorCount = parseInt(localStorage.getItem('visitorCount') || '1000');
      
      if (existingFeedback.length > 0) {
        const totalRatings = existingFeedback.length;
        const averageRating = existingFeedback.reduce((sum, f) => sum + f.rating, 0) / totalRatings;
        
        // Calculate rating distribution
        const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
        existingFeedback.forEach(f => {
          if (f.rating >= 1 && f.rating <= 5) {
            distribution[f.rating - 1]++;
          }
        });
        
        // Convert to percentages
        const percentDistribution = distribution.map(count => 
          totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0
        );
        
        setCustomerStats({
          totalRatings,
          averageRating: Math.round(averageRating * 10) / 10,
          visitorCount: currentVisitorCount,
          ratingDistribution: percentDistribution
        });
      } else {
        // Update visitor count for new visitor
        const newCount = currentVisitorCount + 1;
        localStorage.setItem('visitorCount', newCount.toString());
        setCustomerStats(prev => ({ ...prev, visitorCount: newCount }));
      }
    };

    loadCustomerStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.message.trim()) {
      toast.error('Veuillez entrer votre message de commentaires');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const feedbackData = {
        ...feedback,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        url: window.location.href,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      };

      // Store feedback locally
      const existingFeedback = JSON.parse(localStorage.getItem('customerFeedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('customerFeedback', JSON.stringify(existingFeedback));

      // Update customer stats
      const totalRatings = existingFeedback.length;
      const averageRating = existingFeedback.reduce((sum, f) => sum + f.rating, 0) / totalRatings;
      
      const distribution = [0, 0, 0, 0, 0];
      existingFeedback.forEach(f => {
        if (f.rating >= 1 && f.rating <= 5) {
          distribution[f.rating - 1]++;
        }
      });
      
      const percentDistribution = distribution.map(count => 
        Math.round((count / totalRatings) * 100)
      );
      
      setCustomerStats(prev => ({
        ...prev,
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution: percentDistribution
      }));

      // Try to send to backend if available
      try {
        await api.submitFeedback(feedbackData);
      } catch (serverError) {
        console.log('Server not available, feedback stored locally');
      }
      
      toast.success('Merci pour vos commentaires! 🙏');
      setFeedback({
        type: 'general',
        message: '',
        email: '',
        rating: 5,
        hoverRating: null,
      });
      setIsOpen(false);
      
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Échec de l&apos;envoi des commentaires. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Widget Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-3">
        {/* Ratings Display Button */}
        {customerStats.totalRatings > 0 && (
          <button
            onClick={() => setShowRatings(!showRatings)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-200 flex items-center space-x-2"
            aria-label="Voir les évaluations"
          >
            <StarIconSolid className="h-4 w-4" />
            <span>{customerStats.averageRating}/5 ({customerStats.totalRatings})</span>
          </button>
        )}
        
        {/* Feedback Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Donner des commentaires"
        >
          <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Ratings Display Modal */}
      {showRatings && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-64 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Évaluations Clients</h4>
              <button
                onClick={() => setShowRatings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            
            {/* Average Rating */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIconSolid
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(customerStats.averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {customerStats.averageRating}
              </span>
            </div>
            
            {/* Rating Distribution */}
            <div className="space-y-1">
              {customerStats.ratingDistribution.map((percentage, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <span className="w-8 text-gray-600 dark:text-gray-400">{5-index}★</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-xs text-gray-500 dark:text-gray-400">{percentage}%</span>
                </div>
              )).reverse()}
            </div>
            
            <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
              Basé sur {customerStats.totalRatings} évaluation{customerStats.totalRatings !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📝 Commentaires et suggestions
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Feedback Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de commentaire
                </label>
                <select
                  value={feedback.type}
                  onChange={(e) => setFeedback(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">Commentaire général</option>
                  <option value="bug">Rapport de bug</option>
                  <option value="feature">Demande de fonctionnalité</option>
                  <option value="ui">Problème UI/UX</option>
                  <option value="performance">Problème de performance</option>
                  <option value="admin">Test de fonction admin</option>
                  <option value="mobile">Expérience mobile</option>
                  <option value="payment">Paiement/Commande</option>
                </select>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expérience globale (1-5 étoiles)
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                      onMouseEnter={() => setFeedback(prev => ({ ...prev, hoverRating: star }))}
                      onMouseLeave={() => setFeedback(prev => ({ ...prev, hoverRating: null }))}
                      className={`transition-all duration-200 hover:scale-110 ${
                        star <= (feedback.hoverRating || feedback.rating) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      {star <= (feedback.hoverRating || feedback.rating) ? (
                        <StarIconSolid className="h-6 w-6" />
                      ) : (
                        <StarIcon className="h-6 w-6" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vos commentaires *
                </label>
                <textarea
                  value={feedback.message}
                  onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Veuillez décrire votre expérience, les problèmes rencontrés, ou vos suggestions d'amélioration..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={feedback.email}
                  onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="votre-email@exemple.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Testing Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  🧪 Guide de test
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Essayez de parcourir les produits et utiliser la recherche</li>
                  <li>• Testez le panier et la commande</li>
                  <li>• Vérifiez la compatibilité mobile</li>
                  <li>• Pour les admins: Testez l&apos;ajout et la gestion des produits</li>
                  <li>• Signalez toute erreur ou interface confuse</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4" />
                    <span>Envoyer les commentaires</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;