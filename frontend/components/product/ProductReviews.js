import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '../../hooks/useAuth';
import { StarIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ProductReviews = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    orderId: null
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchReviews();
    if (isAuthenticated) {
      checkCanReview();
    }
  }, [productId, isAuthenticated, fetchReviews, checkCanReview]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/product/${productId}`);
      setReviews(response.data.reviews);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const checkCanReview = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/can-review/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCanReview(response.data.canReview);
      if (response.data.canReview) {
        setReviewForm(prev => ({ ...prev, orderId: response.data.orderId }));
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  }, [productId]);

  const submitReview = async () => {
    try {
      setSubmittingReview(true);
      const token = localStorage.getItem('token');
      
      const reviewData = {
        productId,
        orderId: reviewForm.orderId,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews`,
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Avis soumis avec succès!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '', orderId: null });
      setCanReview(false);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  const voteOnReview = async (reviewId, vote) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${reviewId}/vote`,
        { vote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the review in state
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === reviewId
            ? {
                ...review,
                helpful: {
                  ...review.helpful,
                  [vote]: review.helpful[vote] + 1
                }
              }
            : review
        )
      );
      
      toast.success('Vote enregistré!');
    } catch (error) {
      toast.error('Erreur lors du vote');
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            {star <= rating ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = stats.ratingDistribution[rating] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center text-sm">
              <span className="w-3 text-gray-600">{rating}</span>
              <StarIconSolid className="h-4 w-4 text-yellow-400 ml-1 mr-2" />
              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="w-8 text-right text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Avis clients
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center my-2">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Basé sur {stats.totalReviews} avis
              </div>
            </div>

            {/* Rating Distribution */}
            <div>
              {renderRatingDistribution()}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {isAuthenticated && canReview && !showReviewForm && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
            Vous avez acheté ce produit. Partagez votre expérience!
          </p>
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Écrire un avis
          </button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Écrire un avis
          </h4>
          
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Note
              </label>
              {renderStars(reviewForm.rating, true, (rating) =>
                setReviewForm(prev => ({ ...prev, rating }))
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre de votre avis
              </label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Résumez votre expérience"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                maxLength={100}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Votre avis
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Décrivez votre expérience avec ce produit"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-1">
                {reviewForm.comment.length}/1000 caractères
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={submitReview}
                disabled={submittingReview || !reviewForm.title.trim() || !reviewForm.comment.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {submittingReview ? 'Envoi...' : 'Publier l\'avis'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    {renderStars(review.rating)}
                    {review.verified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Achat vérifié
                      </span>
                    )}
                  </div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    {review.title}
                  </h5>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Par {review.user?.name} • {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {review.comment}
              </p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex space-x-2 mb-4">
                  {review.images.map((image, index) => (
                    <Image
                      key={index}
                      src={image.url}
                      alt={image.alt}
                      className="w-16 h-16 object-cover rounded-lg"
                      width={64}
                      height={64}
                    />
                  ))}
                </div>
              )}

              {/* Store Response */}
              {review.response && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Réponse de Fenkparet
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {review.response.text}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(review.response.respondedAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )}

              {/* Helpfulness */}
              <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Cet avis vous a-t-il été utile?
                </span>
                {isAuthenticated && (
                  <>
                    <button
                      onClick={() => voteOnReview(review._id, 'yes')}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600"
                    >
                      <HandThumbUpIcon className="h-4 w-4" />
                      <span>{review.helpful?.yes || 0}</span>
                    </button>
                    <button
                      onClick={() => voteOnReview(review._id, 'no')}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600"
                    >
                      <HandThumbDownIcon className="h-4 w-4" />
                      <span>{review.helpful?.no || 0}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Aucun avis pour ce produit pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;