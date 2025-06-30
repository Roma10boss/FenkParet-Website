import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  SparklesIcon, 
  HeartIcon, 
  ShieldCheckIcon,
  TruckIcon,
  UsersIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function About() {

  const features = [
    {
      icon: SparklesIcon,
      title: 'Produits de qualité',
      description: 'Nous sélectionnons soigneusement chaque produit pour assurer la plus haute qualité à nos clients à travers Haïti.&apos;'
    },
    {
      icon: TruckIcon,
      title: 'Livraison rapide',
      description: 'Expédition rapide et fiable à travers Haïti avec suivi en temps réel de vos commandes.&apos;'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Paiements sécurisés',
      description: 'Paiements MonCash sûrs et sécurisés avec vérification administrative pour votre tranquillité d&apos;esprit.'
    },
    {
      icon: HeartIcon,
      title: 'Client d\'abord',
      description: 'Votre satisfaction est notre priorité. Nous fournissons un excellent support client et service.'
    }
  ];

  const team = [
    {
      name: 'Équipe Fenkparet',
      role: 'Fondateurs et Opérateurs',
      description: 'Dédiés à apporter des produits de qualité et un excellent service en Haïti.',
      image: null
    }
  ];

  const stats = [
    { label: 'Produits vendus', value: '1,000+' },
    { label: 'Clients satisfaits', value: '500+' },
    { label: 'Villes desservies', value: '10+' },
    { label: 'Note client', value: '4.8/5' }
  ];

  return (
    <>
      <Head>
        <title>À propos | Fenkparet</title>
        <meta name="description" content="Découvrez Fenkparet - votre partenaire de confiance en Haïti. Produits de qualité, livraison rapide et excellent service client." />
        <meta name="keywords" content="about fenkparet, haiti ecommerce, online shopping haiti, moncash" />
      </Head>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                À propos de nous
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Fenkparet est votre partenaire de confiance en Haïti, apportant des produits de qualité 
                et un service exceptionnel directement à votre porte.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Notre histoire
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    Fenkparet est né d&apos;une idée simple : rendre les produits de qualité accessibles 
                    à tous en Haïti. Nous comprenons les défis du shopping en ligne dans notre 
                    beau pays et avons construit notre plateforme pour répondre à ces besoins.
                  </p>
                  <p>
                    Des t-shirts personnalisés aux accessoires uniques, nous sélectionnons soigneusement notre 
                    gamme de produits pour vous assurer d&apos;obtenir le meilleur rapport qualité-prix. Notre intégration 
                    avec MonCash rend les paiements simples et sécurisés.
                  </p>
                  <p>
                    Nous croyons en la transparence, la qualité et la satisfaction client. Chaque commande 
                    est traitée avec soin, et nous nous engageons à fournir une expérience d&apos;achat exceptionnelle 
                    pour notre communauté haïtienne.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-r from-primary-200 to-primary-300 dark:from-primary-800 to-primary-700 rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">🇭🇹</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Fièrement Haïtien
                  </h3>
                  <p className="text-gray-700 dark:text-gray-200">
                    Construit en Haïti, pour Haïti. Soutenant les communautés et entreprises locales.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card">
                <div className="card-body text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HeartIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Notre mission
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Fournir des produits de haute qualité et un service exceptionnel aux clients 
                    à travers Haïti, rendant le shopping en ligne accessible, sécurisé et agréable 
                    pour tous.
                  </p>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <StarIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Notre vision
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Devenir la plateforme la plus fiable d&apos;Haïti, connectant les clients 
                    avec des produits de qualité tout en soutenant la croissance économique locale et 
                    l&apos;innovation numérique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Pourquoi choisir Fenkparet?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                We&apos;re committed to providing the best online shopping experience in Haiti.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-primary-600 dark:bg-primary-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-primary-100">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Nos valeurs
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Confiance
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Construire des relations durables par la transparence et la fiabilité.
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">💎</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Qualité
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Ne jamais compromettre la qualité des produits ou l&apos;excellence du service.
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-body text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Innovation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Améliorer continuellement notre plateforme et nos services pour de meilleures expériences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Prêt à commencer vos achats?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de clients satisfaits qui font confiance à Fenkparet pour leurs besoins d&apos;achat en ligne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="btn btn-primary btn-lg"
              >
                Parcourir les produits
              </Link>
              <Link
                href="/contact"
                className="btn btn-outline btn-lg"
              >
                Contactez-nous
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}