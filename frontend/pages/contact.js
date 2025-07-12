import { useState, useEffect } from 'react';
import Image from 'next/image';
// Removed import Head from 'next/head'; as it's Next.js specific
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-hot-toast';
// Using <a> tags instead of Next.js Link for broader compatibility in this environment

// Import Heroicons for consistent styling
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  PaperClipIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Mock useTranslation hook for standalone React environment
// In your full Next.js application, ensure your actual useTranslation hook is correctly configured
const useTranslation = () => {
  const t = (key, options = {}) => {
    const translations = {
      'contact.fileTooLarge': `File "${options.fileName}" is too large (max 5MB).`,
      'contact.maxFilesExceeded': 'Maximum 3 files allowed.',
      'contact.messageSentSuccess': 'Message sent successfully!',
      'contact.messageSentError': 'Failed to send message. Please try again.',
      'contact.contactUs': 'Contact Us',
      'contact.metaDescription': "Get in touch with us. Send us a message and we'll respond as soon as possible.",
      'contact.getInTouchDescription': "Get in touch with our customer support team",
      'contact.getInTouch': "Get in touch with us.",
      'contact.helpMessage': "We're here to help with any questions about our products or services.",
      'contact.contactInfo': 'Contact Information',
      'contact.email': 'Email',
      'contact.phone': 'Phone',
      'contact.address': 'Address',
      'contact.hours': 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
      'contact.followUs': 'Follow Us',
      'contact.sendMessage': 'Send Us a Message',
      'contact.yourName': 'Your Name',
      'contact.enterFullName': 'Enter your full name',
      'contact.emailAddress': 'Email Address',
      'contact.enterEmail': 'Enter your email',
      'contact.phoneNumber': 'Phone Number',
      'contact.optional': 'optional',
      'contact.enterPhoneNumber': 'Enter your phone number',
      'contact.subject': 'Subject',
      'contact.subjectOptions.general': 'General Inquiry',
      'contact.subjectOptions.product': 'Product Question',
      'contact.subjectOptions.order': 'Order Issue',
      'contact.subjectOptions.shipping': 'Shipping Question',
      'contact.subjectOptions.return': 'Return/Refund',
      'contact.subjectOptions.technical': 'Technical Support',
      'contact.subjectOptions.business': 'Business Inquiry',
      'contact.subjectOptions.other': 'Other',
      'contact.message': 'Message',
      'contact.tellUsHowToHelp': 'Tell us how we can help you...',
      'contact.attachments': 'Attachments',
      'contact.dropFiles': 'Drop files here...',
      'contact.dragOrClick': 'Drag & drop files here, or click to select',
      'contact.fileRequirements': 'Max 3 files, 5MB each. Images and PDFs only.',
      'contact.privacyNoticePart1': 'By submitting this form, you agree to our',
      'contact.privacyNoticePart2': "We'll only use your information to respond to your inquiry.",
      'contact.responseSoon': "We'll get back to you soon.",
      'contact.faq': 'Frequently Asked Questions',
      'contact.faqDescription': 'Quick answers to common questions',
      'common.sending': 'Sending...',
      'common.remove': 'Remove',
      'common.tryAgain': 'Please try again.',
      'footer.privacyPolicy': 'Privacy Policy',
      'faq.shippingTime': 'How long does shipping take?',
      'faq.shippingAnswer': 'Standard delivery takes 3-5 business days. Express delivery is available for 1-2 business days.',
      'faq.paymentMethods': 'What payment methods do you accept?',
      'faq.paymentAnswer': 'We accept MonCash payments. All payments are verified manually by our admin team within 48 hours.',
      'faq.returnsPolicy': 'Can I return or exchange items?',
      'faq.returnsAnswer': 'Yes, we offer a 7-day return policy for items in original condition. Return shipping costs may apply.',
      'faq.customDesigns': 'Do you offer custom designs?',
      'faq.customDesignsAnswer': 'Yes! We offer custom printing on t-shirts, mugs, and other items. Contact us for pricing and details.',
      'faq.trackOrder': 'How can I track my order?',
      'faq.trackOrderAnswer': 'Once your payment is confirmed, you\'ll receive an order number. Use this to track your order status.',
      'faq.internationalShipping': 'Do you ship outside Haiti?',
      'faq.internationalShippingAnswer': 'Currently, we only ship within Haiti. International shipping may be available in the future.',
      'validation.required': 'This field is required',
      'validation.minLength': `Must be at least ${options.min} characters.`,
      'validation.email': 'Please enter a valid email address.'
    };
    return translations[key] || key;
  };
  return { t };
};


export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Use useEffect to set document title for a standalone React app, replacing Next.js Head
  useEffect(() => {
    document.title = `Contact | Fenkparet`;
    // For SEO meta description and JSON-LD, these would typically be handled by a server-side rendering framework
    // or a more sophisticated client-side routing library with Helmet/React-Head.
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  // File upload handling
  const onDrop = (acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`Le fichier "${file.name}" est trop volumineux (max 5MB).`);
        return false;
      }
      return true;
    });

    if (uploadedFiles.length + validFiles.length > 3) {
      toast.error('Maximum 3 fichiers autorisés.');
      return;
    }

    const newFiles = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${file.size}-${Date.now()}`
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 3,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => {
        if (f.id === fileId) {
          URL.revokeObjectURL(f.preview);
          return false;
        }
        return true;
      });
      return updated;
    });
  };

  useEffect(() => {
    return () => {
      uploadedFiles.forEach(fileObj => URL.revokeObjectURL(fileObj.preview));
    };
  }, [uploadedFiles]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone || '');
      formData.append('subject', data.subject || 'General Inquiry');
      formData.append('message', data.message);

      uploadedFiles.forEach((fileObj) => {
        formData.append('attachments', fileObj.file);
      });

      // Placeholder URL for API call since process.env is not available here.
      // Replace with your actual backend endpoint in your full Next.js application.
      const apiUrl = "https://your-api-endpoint.com/api/contact";
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        setSubmitStatus('success');
        toast.success('Message envoyé avec succès! Nous vous répondrons bientôt.');
        reset();
        uploadedFiles.forEach(fileObj => URL.revokeObjectURL(fileObj.preview));
        setUploadedFiles([]);
      } else {
        setSubmitStatus('error');
        toast.error('Échec de l\'envoi du message. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error.response?.data || error.message);
      setSubmitStatus('error');
      toast.error(error.response?.data?.message || 'Échec de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      title: 'Email',
      value: 'fenkparet509@gmail.com',
      link: 'mailto:fenkparet509@gmail.com'
    },
    {
      icon: PhoneIcon,
      title: 'Téléphone',
      value: '(+509) 4745-8821',
      link: 'tel:+50947458821'
    },
    {
      icon: MapPinIcon,
      title: 'Adresse',
      value: 'Port-au-Prince, Haiti',
      link: null
    },
    {
      icon: ClockIcon,
      title: 'Heures d\'ouverture',
      value: 'Lun-Ven: 9h-18h, Sam: 10h-16h',
      link: null
    }
  ];

  const socialLinks = [
    { 
      name: 'Facebook', 
      url: 'https://www.facebook.com/share/1CMGWQkgvc/', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      name: 'Instagram', 
      url: 'https://www.instagram.com/fenkparet?igsh=MWo0Mm1xZDgwNjlwaQ==', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    { 
      name: 'X', 
      url: 'https://x.com/FenkParet?t=ufb_v0B_D4Qj4AIc-G_8HQ&s=09', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    { 
      name: 'YouTube', 
      url: 'https://youtube.com/@fenkparet2862?si=c46Fqko-Y0PIhQdS', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    { 
      name: 'TikTok', 
      url: 'https://www.tiktok.com/@fenkparet?_t=ZM-8xbHrr8LfYj&_r=1', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    },
    { 
      name: 'WhatsApp', 
      url: 'https://wa.me/50947458821', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
        </svg>
      )
    }
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-theme-background text-theme-primary">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-theme-primary mb-4">
            Contact
          </h1>
          <p className="text-lg md:text-xl text-theme-secondary max-w-3xl mx-auto">
            Contactez-nous. Nous sommes là pour vous aider avec toutes vos questions sur nos produits ou services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            {/* Card background in dark mode: #2a312a */}
            <div className="card p-8 bg-white rounded-xl shadow-lg dark:bg-[#2a312a] dark:text-white">
              <h2 className="text-2xl font-bold text-theme-primary mb-8">
                Informations de contact
              </h2>

              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      {/* Icon background: light green #e8f2e8, accent color: #b8d2b3 */}
                      <div className="w-12 h-12 bg-[#e8f2e8] rounded-lg flex items-center justify-center dark:bg-[#374137]">
                        <item.icon className="w-6 h-6 text-[#b8d2b3]" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-theme-primary">
                        {item.title}
                      </h3>
                      {item.link ? (
                        <a
                          href={item.link}
                          className="text-theme-secondary hover:text-[#b8d2b3] transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-theme-secondary">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              {/* Border color adapted for dark mode */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-theme-primary mb-4">
                  Suivez-nous
                </h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      // Background adapts to dark mode, hover uses a subtle dark green
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-theme-secondary
                                 dark:bg-[#1f241f] dark:hover:bg-[#2a312a]"
                      title={social.name}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {/* Card background in dark mode: #2a312a */}
            <div className="card p-8 bg-white rounded-xl shadow-lg dark:bg-[#2a312a] dark:text-white">
              <h2 className="text-2xl font-bold text-theme-primary mb-8">
                Envoyez-nous un message
              </h2>

              {/* Success Message: Green backgrounds for success */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-[#e8f2e8] text-[#33691e] border border-[#b8d2b3] rounded-lg dark:bg-[#374137] dark:text-[#b8d2b3] dark:border-[#b8d2b3]">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-[#33691e] mr-2 dark:text-[#b8d2b3]" />
                    <p>
                      Message envoyé avec succès! Nous vous répondrons bientôt.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message: Themed error states */}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg dark:bg-red-900 dark:text-red-300 dark:border-red-600">
                  <p>
                    Échec de l&apos;envoi du message. Veuillez réessayer.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="form-label text-theme-primary dark:text-gray-300">
                      Votre nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      // Green focus rings and borders
                      className={`form-input w-full p-3 border rounded-lg bg-gray-50 text-gray-900
                                  focus:ring-2 focus:ring-[#b8d2b3] focus:border-transparent outline-none
                                  dark:bg-[#374137] dark:text-white dark:border-gray-600 dark:focus:ring-[#b8d2b3]
                                  ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Entrez votre nom complet"
                      {...register('name', {
                        required: 'Ce champ est requis',
                        minLength: {
                          value: 2,
                          message: 'Doit comporter au moins 2 caractères.'
                        }
                      })}
                    />
                    {errors.name && <p className="form-error text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="form-label text-theme-primary dark:text-gray-300">
                      Adresse email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      // Green focus rings and borders
                      className={`form-input w-full p-3 border rounded-lg bg-gray-50 text-gray-900
                                  focus:ring-2 focus:ring-[#b8d2b3] focus:border-transparent outline-none
                                  dark:bg-[#374137] dark:text-white dark:border-gray-600 dark:focus:ring-[#b8d2b3]
                                  ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Entrez votre email"
                      {...register('email', {
                        required: 'Ce champ est requis',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Veuillez entrer une adresse email valide.'
                        }
                      })}
                    />
                    {errors.email && <p className="form-error text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                {/* Phone and Subject Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="form-label text-theme-primary dark:text-gray-300">
                      Numéro de téléphone <span className="text-gray-500 dark:text-gray-400">(optionnel)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      // Green focus rings
                      className="form-input w-full p-3 border rounded-lg bg-gray-50 text-gray-900
                                 focus:ring-2 focus:ring-[#b8d2b3] focus:border-transparent outline-none
                                 dark:bg-[#374137] dark:text-white dark:border-gray-600 dark:focus:ring-[#b8d2b3]"
                      placeholder="Entrez votre numéro de téléphone"
                      {...register('phone')}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="form-label text-theme-primary dark:text-gray-300">
                      Sujet <span className="text-gray-500 dark:text-gray-400">(optionnel)</span>
                    </label>
                    <select
                      id="subject"
                      // Green focus rings
                      className="form-input w-full p-3 border rounded-lg bg-gray-50 text-gray-900
                                 focus:ring-2 focus:ring-[#b8d2b3] focus:border-transparent outline-none
                                 dark:bg-[#374137] dark:text-white dark:border-gray-600 dark:focus:ring-[#b8d2b3]"
                      {...register('subject')}>
                      <option value="Demande générale">Demande générale</option>
                      <option value="Question sur un produit">Question sur un produit</option>
                      <option value="Problème de commande">Problème de commande</option>
                      <option value="Question de livraison">Question de livraison</option>
                      <option value="Retour/Remboursement">Retour/Remboursement</option>
                      <option value="Support technique">Support technique</option>
                      <option value="Demande commerciale">Demande commerciale</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="form-label text-theme-primary dark:text-gray-300">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    id="message"
                    // Green focus rings and borders
                    className={`form-input w-full p-3 border rounded-lg bg-gray-50 text-gray-900
                                focus:ring-2 focus:ring-[#b8d2b3] focus:border-transparent outline-none
                                dark:bg-[#374137] dark:text-white dark:border-gray-600 dark:focus:ring-[#b8d2b3]
                                ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Dites-nous comment nous pouvons vous aider..."
                    {...register('message', {
                      required: 'validation.required',
                      minLength: {
                        value: 10,
                        message: 'Doit comporter au moins 10 caractères.'
                      }
                    })}
                  />
                  {errors.message && <p className="form-error text-red-500 text-sm mt-1">{errors.message.message}</p>}
                </div>

                {/* File Upload */}
                <div>
                  <label className="form-label text-theme-primary dark:text-gray-300">
                    Pièces jointes <span className="text-gray-500 dark:text-gray-400">(optionnel)</span>
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                                ${isDragActive
                                    ? 'border-[#b8d2b3] bg-[#e8f2e8] dark:bg-[#374137] dark:border-[#b8d2b3]'
                                    : 'border-gray-300 bg-gray-50 hover:border-[#b8d2b3] dark:bg-[#374137] dark:border-gray-600 dark:hover:border-[#b8d2b3]'
                                }`}
                  >
                    <input {...getInputProps()} />
                    <PaperClipIcon className="h-12 w-12 text-gray-400 mx-auto mb-4 dark:text-gray-500" />
                    <p className="text-gray-600 mb-2 dark:text-gray-300">
                      {isDragActive
                        ? 'Déposez les fichiers ici...'
                        : 'Glissez-déposez les fichiers ici, ou cliquez pour sélectionner'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Max 3 fichiers, 5MB chacun. Images et PDF uniquement.
                    </p>
                  </div>

                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((fileObj) => (
                        <div
                          key={fileObj.id}
                          className="flex items-center justify-between p-3 bg-gray-100 rounded-lg text-gray-900
                                     dark:bg-[#374137] dark:text-white"
                        >
                          <div className="flex items-center">
                            {fileObj.file.type.startsWith('image/') ? (
                              <Image src={fileObj.preview} alt={fileObj.file.name} width={32} height={32} className="h-8 w-8 object-cover rounded-md mr-2" />
                            ) : (
                              <PaperClipIcon className="h-5 w-5 text-[#b8d2b3] mr-2" />
                            )}
                            <span className="text-sm">
                              {fileObj.file.name}
                            </span>
                            <span className="text-xs text-gray-500 ml-2 dark:text-gray-400">
                              ({(fileObj.file.size / (1024 * 1024)).toFixed(1)}MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(fileObj.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                            aria-label="Retirer"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button: Prominent green CTA */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-300
                               bg-[#b8d2b3] hover:bg-[#a0bb9d] focus:outline-none focus:ring-2 focus:ring-[#b8d2b3] focus:ring-offset-2
                               dark:bg-[#b8d2b3] dark:hover:bg-[#a0bb9d] dark:focus:ring-offset-[#1f241f]
                               flex items-center justify-center
                               disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        {/* Loading spinner in green */}
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.962l1-1.671z"></path>
                        </svg>
                        Envoi en cours...
                      </div>
                    ) : (
                      <>
                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                        Envoyer un message
                      </>
                    )}
                  </button>
                </div>

                {/* Privacy Notice: Green on hover for links */}
                <p className="text-sm text-gray-600 text-center dark:text-gray-400">
                  En soumettant ce formulaire, vous acceptez notre{' '}
                  <a href="/privacy" className="text-[#b8d2b3] hover:text-[#a0bb9d] transition-colors">
                    Politique de confidentialité
                  </a>
                  . Nous utiliserons uniquement vos informations pour répondre à votre demande.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
              Questions fréquemment posées
            </h2>
            <p className="text-lg text-theme-secondary">
              Réponses rapides aux questions courantes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md dark:bg-[#2a312a] dark:text-white">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Combien de temps prend la livraison?
                </h3>
                <p className="text-theme-secondary">
                  La livraison standard prend 3-5 jours ouvrables. La livraison express est disponible pour 1-2 jours ouvrables.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md dark:bg-[#2a312a] dark:text-white">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Quels modes de paiement acceptez-vous?
                </h3>
                <p className="text-theme-secondary">
                  Nous acceptons les paiements MonCash. Tous les paiements sont vérifiés manuellement par notre équipe d&apos;administration dans les 48 heures.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md dark:bg-[#2a312a] dark:text-white">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Puis-je retourner ou échanger des articles?
                </h3>
                <p className="text-theme-secondary">
                  Oui, nous offrons une politique de retour de 7 jours pour les articles en état d&apos;origine. Les frais de retour peuvent s&apos;appliquer.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md dark:bg-[#2a312a] dark:text-white">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Proposez-vous des designs personnalisés?
                </h3>
                <p className="text-theme-secondary">
                  Oui! Nous proposons l&apos;impression personnalisée sur t-shirts, tasses et autres articles. Contactez-nous pour les prix et détails.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md dark:bg-[#2a312a] dark:text-white">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Comment puis-je suivre ma commande?
                </h3>
                <p className="text-theme-secondary">
                  Une fois votre paiement confirmé, vous recevrez un numéro de commande. Utilisez-le pour suivre le statut de votre commande.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md dark:bg-[#2a312a] dark:text-white">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">
                  Livrez-vous en dehors d&apos;Haïti?
                </h3>
                <p className="text-theme-secondary">
                  Actuellement, nous ne livrons qu&apos;en Haïti. La livraison internationale pourrait être disponible à l&apos;avenir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
