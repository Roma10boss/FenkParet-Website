// components/product/ProductGrid.js
import ProductCard from './ProductCard'; // Ensure correct path

const ProductGrid = ({ products }) => {
  if (!products || products.length === 0) {
    // This message is now less likely to be seen if pages/index.js handles empty arrays
    // but useful if ProductGrid is used elsewhere without pre-filtering
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-10">
        No products found.
      </div>
    );
  }

  return (
    // Ensure product-grid class is defined in tailwind.config.js as a component
    // or manually apply these Tailwind classes:
    <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product._id || product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;