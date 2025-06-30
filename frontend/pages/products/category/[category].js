// pages/products/category/[category].js
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/layout/Layout';

const ProductCategoryPage = () => {
  const router = useRouter();
  const { category } = router.query;

  return (
    <Layout title={`Category: ${category}`}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Products in Category: {category}</h1>
        <p>This is a placeholder page for product listings by category. Content coming soon!</p>
        {/* You'll fetch and display products for this category here */}
      </div>
    </Layout>
  );
};

export default ProductCategoryPage;