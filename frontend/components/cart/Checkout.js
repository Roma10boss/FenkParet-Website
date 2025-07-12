import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router'; // Added for potential redirects
import { useForm } from 'react-hook-form'; // Assuming react-hook-form is used in the full component
import { CreditCardIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; // Assuming these are needed for the full component

import { useAuth } from '../../hooks/useAuth'; // CORRECTED PATH to hooks/useAuth
import { useCart } from '../../context/CartContext'; 
import { useTheme } from '../../context/ThemeContext'; // Ensure theme is imported for `mounted`
import { LoadingPage } from '../ui/LoadingPage';
import { toast } from 'react-hot-toast'; // For notifications
import axios from 'axios'; // For API calls

const Checkout = () => {
  const router = useRouter();
  const { 
    items, 
    getTotals, 
    isEmpty, 
    customerInfo, 
    shippingAddress,
    setCustomerInfo, // Assuming these setters exist in your CartContext
    setShippingAddress, // Assuming these setters exist in your CartContext
    clearCart 
  } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Destructure `loading` as `authLoading`
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const currentLocale = 'en';
  const { mounted: themeMounted } = useTheme(); // Get mounted state from ThemeContext

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      // Pre-fill with user data if authenticated, or existing customer/shipping info
      firstName: user?.firstName || customerInfo?.firstName || '',
      lastName: user?.lastName || customerInfo?.lastName || '',
      email: user?.email || customerInfo?.email || '',
      phone: user?.phone || customerInfo?.phone || '',
      street: shippingAddress?.street || '',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      postalCode: shippingAddress?.postalCode || '',
      country: shippingAddress?.country || 'Haiti',
      sameAsBilling: true,
      // Billing address fields (if not same as shipping)
      billingStreet: '',
      billingCity: '',
      billingState: '',
      billingPostalCode: '',
      billingCountry: 'Haiti',
      // MonCash confirmation number
      confirmationNumber: '',
      monCashName: ''
    }
  });

  const watchSameAsBilling = watch('sameAsBilling');
  const totals = getTotals();

  // Redirect if cart is empty (only client-side and after mounting)
  // This is a component-level redirect. The pages/checkout.js also has one.
  useEffect(() => {
    if (themeMounted && !authLoading && isEmpty()) {
      router.push('/cart');
    }
  }, [isEmpty, router, themeMounted, authLoading]);

  // Pre-fill user data into the form
  useEffect(() => {
    // Only pre-fill if authenticated and component is mounted
    if (user && isAuthenticated && themeMounted && !authLoading) {
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('email', user.email || '');
      if (user.phone) setValue('phone', user.phone);
      
      // Pre-fill address if available
      if (user.address) {
        setValue('street', user.address.street || '');
        setValue('city', user.address.city || '');
        setValue('state', user.address.state || '');
        setValue('postalCode', user.address.postalCode || '');
        setValue('country', user.address.country || 'Haiti');
      }
    }
  }, [user, isAuthenticated, setValue, themeMounted, authLoading]);

  const steps = [
    { id: 1, name: 'checkout.customerInfo', completed: false },
    { id: 2, name: 'checkout.shippingAddress', completed: false },
    { id: 3, name: 'checkout.paymentMethod', completed: false },
    { id: 4, name: 'checkout.orderSummary', completed: false }
  ];

  const handleStepSubmit = (data) => {
    switch (currentStep) {
      case 1:
        setCustomerInfo({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone
        });
        setCurrentStep(2);
        break;
      case 2:
        setShippingAddress({
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country
        });
        setCurrentStep(3);
        break;
      case 3:
        // No data to save for this step, just advance
        setCurrentStep(4);
        break;
      case 4:
        submitOrder(data);
        break;
      default:
        break;
    }
  };

  const submitOrder = async (data) => {
    setIsSubmitting(true);

    try {
      const orderData = {
        items: items.map(item => ({
          product: item.productId, // Use productId, not item.product._id
          variant: item.variant ? item.variant.id : null, // Assuming variant has an id
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          userId: user?.id || null, // Include user ID if available
        },
        shippingAddress: {
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country
        },
        billingAddress: data.sameAsBilling ? {
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          sameAsShipping: true
        } : {
          street: data.billingStreet,
          city: data.billingCity,
          state: data.billingState,
          postalCode: data.billingPostalCode,
          country: data.billingCountry,
          sameAsShipping: false
        },
        payment: {
          method: 'moncash',
          moncash: {
            confirmationNumber: data.confirmationNumber,
            customerName: data.monCashName,
            amount: totals.total // Send the calculated total
          }
        },
        language: currentLocale,
        totalAmount: totals.total, // Ensure total amount is sent
      };

      // API POST request to the backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/orders/checkout`, orderData, {
        headers: {
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
          'Content-Type': 'application/json'
        }
      });

      setOrderResult(response.data.order);
      clearCart(); // Clear cart after successful order
      setCurrentStep(5); // Success step

    } catch (error) {
      console.error('Order submission error:', error);
      // Use toast instead of alert for better UX
      toast.error(error.response?.data?.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Overall page loading state (auth, theme, etc.)
  const pageIsLoading = authLoading || !themeMounted;

  if (pageIsLoading) {
    return <LoadingPage message="Loading checkout..." />;
  }

  // If cart is empty after initial load and no order result, redirect (handled by parent page as well)
  if (isEmpty() && !orderResult) {
    return null; 
  }

  // Order success page
  if (currentStep === 5 && orderResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center bg-theme-primary rounded-lg shadow-lg text-theme-primary">
        <CheckCircleIcon className="h-16 w-16 text-success-color mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-theme-primary mb-4">
          Order Placed Successfully!
        </h1>
        <p className="text-theme-secondary mb-8">
          Thank you for your order. We&apos;ve received your payment information and will verify it within 48 hours.
        </p>
        
        <div className="bg-theme-tertiary rounded-lg p-6 mb-8 text-theme-primary">
          <h2 className="font-semibold text-theme-primary mb-4">Order Details</h2>
          <div className="space-y-2 text-sm text-theme-secondary">
            <div className="flex justify-between">
              <span>Order Number:</span>
              <span className="font-medium text-theme-primary">{orderResult.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-medium text-theme-primary">{formatCurrency(orderResult.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium capitalize text-theme-primary">{orderResult.status?.replace('-', ' ') || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-0 md:flex md:justify-center md:space-x-4">
          <button
            onClick={() => router.push(`/orders/track?order=${orderResult.orderNumber}`)}
            className="btn-primary" // Use theme-aware button
          >
            Track Your Order
          </button>
          <button
            onClick={() => router.push('/products')}
            className="btn-outline" // Use theme-aware button
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-theme-primary text-theme-primary theme-transition">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.slice(0, 4).map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'border-accent bg-accent text-accent-contrast' // Active state
                  : 'border-theme-tertiary text-theme-secondary' // Inactive state
              }`}>
                {currentStep > step.id ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step.id ? 'text-accent' : 'text-theme-secondary' // Use theme colors
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`ml-4 w-16 h-0.5 ${
                  currentStep > step.id ? 'bg-accent' : 'bg-theme-tertiary' // Use theme colors
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(handleStepSubmit)} className="space-y-6">
            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div className="card p-6"> {/* Use theme-aware card class */}
                <h2 className="text-xl font-semibold text-theme-primary mb-6"> {/* Use theme colors */}
                  {'checkout.customerInfo'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">{'checkout.firstName'}</label>
                    <input
                      type="text"
                      className={`form-input ${errors.firstName ? 'border-error-color' : ''}`} // Use theme error color
                      {...register('firstName', { required: 'validation.required' })}
                    />
                    {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <label className="form-label">{'checkout.lastName'}</label>
                    <input
                      type="text"
                      className={`form-input ${errors.lastName ? 'border-error-color' : ''}`} // Use theme error color
                      {...register('lastName', { required: 'validation.required' })}
                    />
                    {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
                  </div>

                  <div>
                    <label className="form-label">{'checkout.email'}</label>
                    <input
                      type="email"
                      className={`form-input ${errors.email ? 'border-error-color' : ''}`} // Use theme error color
                      {...register('email', { 
                        required: 'validation.required',
                        pattern: { value: /^\S+@\S+$/i, message: 'validation.email' }
                      })}
                    />
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="form-label">{'checkout.phone'}</label>
                    <input
                      type="tel"
                      className="form-input"
                      {...register('phone')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <div className="card p-6"> {/* Use theme-aware card class */}
                <h2 className="text-xl font-semibold text-theme-primary mb-6"> {/* Use theme colors */}
                  {'checkout.shippingAddress'}
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="form-label">{'checkout.street'}</label>
                    <input
                      type="text"
                      className={`form-input ${errors.street ? 'border-error-color' : ''}`} // Use theme error color
                      {...register('street', { required: 'validation.required' })}
                    />
                    {errors.street && <p className="form-error">{errors.street.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">{'checkout.city'}</label>
                      <input
                        type="text"
                        className={`form-input ${errors.city ? 'border-error-color' : ''}`} // Use theme error color
                        {...register('city', { required: 'validation.required' })}
                      />
                      {errors.city && <p className="form-error">{errors.city.message}</p>}
                    </div>

                    <div>
                      <label className="form-label">{'checkout.state'}</label>
                      <input
                        type="text"
                        className="form-input"
                        {...register('state')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">{'checkout.postalCode'}</label>
                      <input
                        type="text"
                        className="form-input"
                        {...register('postalCode')}
                      />
                    </div>

                    <div>
                      <label className="form-label">{'checkout.country'}</label>
                      <select className="form-input" {...register('country')}>
                        <option value="Haiti">Haiti</option>
                      </select>
                    </div>
                  </div>

                  {/* Same as billing address checkbox */}
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="sameAsBilling"
                      className="rounded border-theme text-accent shadow-sm focus:ring-accent focus:border-accent" // Use theme colors
                      {...register('sameAsBilling')}
                    />
                    <label htmlFor="sameAsBilling" className="ml-2 text-sm text-theme-primary">Billing address same as shipping</label>
                  </div>

                  {/* Billing Address (conditionally rendered) */}
                  {!watchSameAsBilling && (
                    <div className="space-y-6 mt-6 p-4 border border-theme rounded-md bg-theme-tertiary"> {/* Use theme colors */}
                      <h3 className="text-lg font-semibold text-theme-primary mb-4">Billing Address</h3>
                      <div>
                        <label className="form-label">{'checkout.street'}</label>
                        <input
                          type="text"
                          className={`form-input ${errors.billingStreet ? 'border-error-color' : ''}`} // Use theme error color
                          {...register('billingStreet', { required: 'validation.required' })}
                        />
                        {errors.billingStreet && <p className="form-error">{errors.billingStreet.message}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="form-label">{'checkout.city'}</label>
                          <input
                            type="text"
                            className={`form-input ${errors.billingCity ? 'border-error-color' : ''}`} // Use theme error color
                            {...register('billingCity', { required: 'validation.required' })}
                          />
                          {errors.billingCity && <p className="form-error">{errors.billingCity.message}</p>}
                        </div>
                        <div>
                          <label className="form-label">{'checkout.state'}</label>
                          <input
                            type="text"
                            className="form-input"
                            {...register('billingState')}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="form-label">{'checkout.postalCode'}</label>
                          <input
                            type="text"
                            className="form-input"
                            {...register('billingPostalCode')}
                          />
                        </div>
                        <div>
                          <label className="form-label">{'checkout.country'}</label>
                          <select className="form-input" {...register('billingCountry')}>
                            <option value="Haiti">Haiti</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <div className="card p-6"> {/* Use theme-aware card class */}
                <h2 className="text-xl font-semibold text-theme-primary mb-6"> {/* Use theme colors */}
                  {'checkout.paymentMethod'}
                </h2>
                
                <div className="mb-6">
                  <div className="flex items-center p-4 border-2 border-accent rounded-lg bg-accent-light"> {/* Use theme colors */}
                    <CreditCardIcon className="h-6 w-6 text-accent mr-3" /> {/* Use theme color */}
                    <div>
                      <h3 className="font-medium text-theme-primary">MonCash</h3> {/* Use theme color */}
                      <p className="text-sm text-theme-secondary"> {/* Use theme color */}
                        Pay securely with MonCash
                      </p>
                    </div>
                  </div>
                </div>

                {/* MonCash Details */}
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">MonCash Confirmation Number</label>
                    <input
                      type="text"
                      className={`form-input ${errors.confirmationNumber ? 'border-error-color' : ''}`}
                      {...register('confirmationNumber', { required: 'validation.required' })}
                    />
                    {errors.confirmationNumber && <p className="form-error">{errors.confirmationNumber.message}</p>}
                    <p className="text-sm text-theme-secondary mt-1">The 8-digit confirmation number from your MonCash transaction.</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">MonCash Account Name</label>
                    <input
                      type="text"
                      className={`form-input ${errors.monCashName ? 'border-error-color' : ''}`}
                      {...register('monCashName', { required: 'validation.required' })}
                    />
                    {errors.monCashName && <p className="form-error">{errors.monCashName.message}</p>}
                    <p className="text-sm text-theme-secondary mt-1">Name on the MonCash account used for payment.</p>
                  </div>
                </div>

                <div className="flex items-start text-info-color mt-6 p-4 rounded-lg bg-info-light border border-info-color"> {/* Use theme colors */}
                  <InformationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5 mr-2" />
                  <p className="text-sm">
                    After placing your order, please send the total amount to the MonCash number: <strong>+509 37XX-XXXX</strong> (replace with your actual number). Your order will be confirmed upon successful payment verification.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Order Summary */}
            {currentStep === 4 && (
              <div className="card p-6"> {/* Use theme-aware card class */}
                <h2 className="text-xl font-semibold text-theme-primary mb-6"> {/* Use theme colors */}
                  {'checkout.orderSummary' || 'Order Summary'}
                </h2>

                <div className="space-y-4">
                  {/* Customer Info Review */}
                  <div>
                    <h3 className="font-semibold text-theme-primary mb-2">{'checkout.customerInfo' || 'Customer Information'}</h3>
                    <p className="text-theme-secondary">
                      {customerInfo?.firstName} {customerInfo?.lastName} <br />
                      {customerInfo?.email} <br />
                      {customerInfo?.phone}
                    </p>
                  </div>

                  {/* Shipping Address Review */}
                  <div>
                    <h3 className="font-semibold text-theme-primary mb-2">{'checkout.shippingAddress' || 'Shipping Address'}</h3>
                    <p className="text-theme-secondary">
                      {shippingAddress?.street} <br />
                      {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postalCode} <br />
                      {shippingAddress?.country}
                    </p>
                  </div>

                  {/* Billing Address Review (if different) */}
                  {!watchSameAsBilling && (
                    <div>
                      <h3 className="font-semibold text-theme-primary mb-2">{'checkout.billingAddress' || 'Billing Address'}</h3>
                      <p className="text-theme-secondary">
                        {watch('billingStreet')} <br />
                        {watch('billingCity')}, {watch('billingState')} {watch('billingPostalCode')} <br />
                        {watch('billingCountry')}
                      </p>
                    </div>
                  )}

                  {/* Payment Method Review */}
                  <div>
                    <h3 className="font-semibold text-theme-primary mb-2">{'checkout.paymentMethod' || 'Payment Method'}</h3>
                    <p className="text-theme-secondary">MonCash ({watch('confirmationNumber')})</p>
                    <p className="text-theme-secondary">Account Name: {watch('monCashName')}</p>
                  </div>

                  {/* Order Items Review */}
                  <div>
                    <h3 className="font-semibold text-theme-primary mb-2">{'checkout.items' || 'Items'}</h3>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item.id} className="flex justify-between text-theme-secondary text-sm">
                          <span>{item.name} {item.variant ? `(${item.variant.name})` : ''} x {item.quantity}</span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-theme pt-4 mt-4 space-y-2"> {/* Use theme colors */}
                    <div className="flex justify-between text-theme-primary">
                      <span>{'checkout.subtotal' || 'Subtotal'}:</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-theme-primary">
                      <span>{'checkout.shipping' || 'Shipping'}:</span>
                      <span>{formatCurrency(totals.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-theme-primary">
                      <span>{'checkout.tax' || 'Tax'}:</span>
                      <span>{formatCurrency(totals.tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-accent"> {/* Use accent color */}
                      <span>{'checkout.total' || 'Total'}:</span>
                      <span>{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {currentStep > 1 && currentStep < 5 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="btn-outline" // Use theme-aware button
                >
                  {'common.previous' || 'Previous'}
                </button>
              )}

              {currentStep < 4 && (
                <button
                  type="submit"
                  className={`btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} // Use theme-aware button
                  disabled={isSubmitting}
                >
                  {'common.next' || 'Next'}
                </button>
              )}

              {currentStep === 4 && (
                <button
                  type="submit"
                  className={`btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} // Use theme-aware button
                  disabled={isSubmitting}
                >
                  {isSubmitting ? ('checkout.placingOrder' || 'Placing Order...') : ('checkout.placeOrder' || 'Place Order')}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Order Summary Sidebar (Always visible) */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4"> {/* Use theme-aware card class */}
            <h2 className="text-xl font-semibold text-theme-primary mb-4">{'checkout.yourOrder' || 'Your Order'}</h2> {/* Use theme colors */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center text-sm">
                  <div className="w-16 h-16 bg-theme-tertiary rounded-md overflow-hidden mr-3"> {/* Use theme colors */}
                    <Image src={item.image} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-theme-primary">{item.name} {item.variant ? `(${item.variant.name})` : ''}</p> {/* Use theme color */}
                    <p className="text-theme-secondary">{item.quantity} x {formatCurrency(item.price)}</p> {/* Use theme color */}
                  </div>
                  <span className="font-semibold text-theme-primary">{formatCurrency(item.price * item.quantity)}</span> {/* Use theme color */}
                </div>
              ))}
            </div>

            <div className="border-t border-theme pt-4 mt-4 space-y-2"> {/* Use theme colors */}
              <div className="flex justify-between text-theme-primary">
                <span>{'checkout.subtotal' || 'Subtotal'}:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-theme-primary">
                <span>{'checkout.shipping' || 'Shipping'}:</span>
                <span>{formatCurrency(totals.shipping)}</span>
              </div>
              <div className="flex justify-between text-theme-primary">
                <span>{'checkout.tax' || 'Tax'}:</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-accent"> {/* Use accent color */}
                <span>{'checkout.total' || 'Total'}:</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
