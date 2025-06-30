const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected for seeding');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Clear existing data
const clearDatabase = async () => {
    try {
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('Database cleared');
    } catch (error) {
        console.error('Error clearing database:', error);
    }
};

// Seed admin user
const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@fenkparet.com' });

        if (!adminExists) {
            const admin = new User({
                name: 'Admin User',
                email: 'admin@fenkparet.com',
                password: 'Admin123!',
                role: 'admin',
                isAdmin: true,
                isActive: true,
                emailVerified: true,
                phone: '+50912345678',
                addresses: [{
                    type: 'work',
                    street: '123 Admin Street',
                    city: 'Port-au-Prince',
                    state: 'Ouest',
                    zipCode: 'HT1234',
                    country: 'Haiti',
                    isDefault: true
                }],
                preferences: {
                    language: 'en',
                    currency: 'HTG',
                    notifications: {
                        email: true,
                        sms: false,
                        push: true
                    }
                }
            });

            await admin.save();
            console.log('Admin user created');
            console.log('Admin credentials:');
            console.log('Email: admin@fenkparet.com');
            console.log('Password: Admin123!');
            return admin;
        } else {
            console.log('Admin user already exists');
            return adminExists;
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};

// Seed sample users
const seedUsers = async () => {
    try {
        const users = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: await bcrypt.hash('password123', 12),
                phone: '+50923456789',
                addresses: [{
                    type: 'home',
                    street: '456 Main Street',
                    city: 'Port-au-Prince',
                    state: 'Ouest',
                    zipCode: 'HT1234',
                    country: 'Haiti',
                    isDefault: true
                }],
                preferences: {
                    language: 'en',
                    currency: 'HTG'
                }
            },
            {
                name: 'Marie Pierre',
                email: 'marie@example.com',
                password: await bcrypt.hash('password123', 12),
                phone: '+50934567890',
                addresses: [{
                    type: 'home',
                    street: '789 Second Avenue',
                    city: 'Cap-Haïtien',
                    state: 'Nord',
                    zipCode: 'HT5678',
                    country: 'Haiti',
                    isDefault: true
                }],
                preferences: {
                    language: 'fr',
                    currency: 'HTG'
                }
            },
            {
                name: 'James Smith',
                email: 'james@example.com',
                password: await bcrypt.hash('password123', 12),
                phone: '+50945678901',
                preferences: {
                    language: 'en',
                    currency: 'HTG'
                }
            }
        ];

        await User.insertMany(users);
        console.log(`${users.length} sample users created`);
    } catch (error) {
        console.error('Error creating sample users:', error);
    }
};

// Seed categories
const seedCategories = async (adminId) => {
    try {
        const categories = [
            {
                name: 'T-Shirts',
                slug: 't-shirts',
                description: 'Comfortable and stylish t-shirts for everyone',
                sortOrder: 1,
                isActive: true,
                createdBy: adminId,
                attributes: [
                    { name: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: true },
                    { name: 'Color', type: 'select', options: ['Black', 'White', 'Blue', 'Red', 'Green'], required: true },
                    { name: 'Material', type: 'text', required: false }
                ]
            },
            {
                name: 'Mugs',
                slug: 'mugs',
                description: 'Custom mugs for your morning coffee',
                sortOrder: 2,
                isActive: true,
                createdBy: adminId,
                attributes: [
                    { name: 'Size', type: 'select', options: ['Small (8oz)', 'Medium (11oz)', 'Large (15oz)'], required: true },
                    { name: 'Color', type: 'select', options: ['White', 'Black', 'Blue', 'Red'], required: false }
                ]
            },
            {
                name: 'Keychains',
                slug: 'keychains',
                description: 'Personalized keychains and accessories',
                sortOrder: 3,
                isActive: true,
                createdBy: adminId,
                attributes: [
                    { name: 'Material', type: 'select', options: ['Metal', 'Plastic', 'Leather', 'Wood'], required: true },
                    { name: 'Shape', type: 'select', options: ['Round', 'Square', 'Heart', 'Custom'], required: false }
                ]
            },
            {
                name: 'Phone Cases',
                slug: 'phone-cases',
                description: 'Protective cases for your mobile devices',
                sortOrder: 4,
                isActive: true,
                createdBy: adminId,
                attributes: [
                    { name: 'Phone Model', type: 'select', options: ['iPhone 14', 'iPhone 13', 'Samsung Galaxy S23', 'Samsung Galaxy S22'], required: true },
                    { name: 'Material', type: 'select', options: ['Silicone', 'Hard Plastic', 'Leather'], required: true },
                    { name: 'Color', type: 'select', options: ['Clear', 'Black', 'White', 'Blue', 'Red'], required: false }
                ]
            },
            {
                name: 'Hoodies & Sweatshirts',
                slug: 'hoodies',
                description: 'Warm and comfortable hoodies',
                sortOrder: 5,
                isActive: true,
                createdBy: adminId,
                attributes: [
                    { name: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], required: true },
                    { name: 'Color', type: 'select', options: ['Black', 'Gray', 'Navy', 'White'], required: true }
                ]
            }
        ];

        const createdCategories = await Category.insertMany(categories);
        console.log(`${createdCategories.length} categories created`);
        return createdCategories;
    } catch (error) {
        console.error('Error creating categories:', error);
        return [];
    }
};

// Seed products
const seedProducts = async (adminId, categories) => {
    try {
        // Find category IDs
        const tshirtCategory = categories.find(cat => cat.slug === 't-shirts');
        const mugCategory = categories.find(cat => cat.slug === 'mugs');
        const keychainCategory = categories.find(cat => cat.slug === 'keychains');
        const phoneCaseCategory = categories.find(cat => cat.slug === 'phone-cases');
        const hoodieCategory = categories.find(cat => cat.slug === 'hoodies');

        const products = [
            // T-Shirts
            {
                name: 'Premium Cotton T-Shirt',
                description: 'Made from 100% premium cotton, this comfortable t-shirt is perfect for everyday wear. Features a classic fit and comes in multiple colors and sizes.',
                shortDescription: 'Premium cotton t-shirt with classic fit',
                category: tshirtCategory._id,
                price: 250,
                comparePrice: 300,
                sku: 'TSH-001',
                weight: 0.2,
                images: [
                    { url: '/images/products/tshirt-premium-1.jpg', alt: 'Premium Cotton T-Shirt', isPrimary: true },
                    { url: '/images/products/tshirt-premium-2.jpg', alt: 'Premium Cotton T-Shirt Back' }
                ],
                variants: [
                    { name: 'Size', value: 'S', priceAdjustment: 0, quantity: 25 },
                    { name: 'Size', value: 'M', priceAdjustment: 0, quantity: 30 },
                    { name: 'Size', value: 'L', priceAdjustment: 0, quantity: 20 },
                    { name: 'Size', value: 'XL', priceAdjustment: 10, quantity: 15 }
                ],
                tags: ['cotton', 'casual', 'unisex', 'premium'],
                featured: true,
                status: 'active',
                inventory: {
                    trackQuantity: true,
                    quantity: 90,
                    lowStockThreshold: 10,
                    stockStatus: 'in-stock'
                },
                seo: {
                    title: 'Premium Cotton T-Shirt | Comfortable & Stylish',
                    description: 'Shop our premium cotton t-shirt in multiple sizes and colors. Perfect for everyday wear.',
                    keywords: ['t-shirt', 'cotton', 'casual wear', 'haiti']
                },
                createdBy: adminId
            },
            {
                name: 'Basic Cotton Tee',
                description: 'Simple and comfortable basic cotton t-shirt. Great value for everyday wear.',
                shortDescription: 'Basic cotton t-shirt - great value',
                category: tshirtCategory._id,
                price: 180,
                sku: 'TSH-002',
                weight: 0.18,
                images: [
                    { url: '/images/products/tshirt-basic-1.jpg', alt: 'Basic Cotton Tee', isPrimary: true }
                ],
                variants: [
                    { name: 'Size', value: 'S', priceAdjustment: 0, quantity: 20 },
                    { name: 'Size', value: 'M', priceAdjustment: 0, quantity: 25 },
                    { name: 'Size', value: 'L', priceAdjustment: 0, quantity: 18 }
                ],
                tags: ['cotton', 'basic', 'affordable'],
                status: 'active',
                inventory: {
                    trackQuantity: true,
                    quantity: 63,
                    lowStockThreshold: 10,
                    stockStatus: 'in-stock'
                },
                createdBy: adminId
            },

            // Mugs
            {
                name: 'Custom Coffee Mug',
                description: 'High-quality ceramic mug perfect for your morning coffee. Can be customized with your design.',
                shortDescription: 'Custom ceramic coffee mug',
                category: mugCategory._id,
                price: 120,
                comparePrice: 150,
                sku: 'MUG-001',
                weight: 0.4,
                images: [
                    { url: '/images/products/mug-custom-1.jpg', alt: 'Custom Coffee Mug', isPrimary: true },
                    { url: '/images/products/mug-custom-2.jpg', alt: 'Custom Coffee Mug Design' }
                ],
                variants: [
                    { name: 'Size', value: 'Small (8oz)', priceAdjustment: 0, quantity: 30 },
                    { name: 'Size', value: 'Medium (11oz)', priceAdjustment: 10, quantity: 40 },
                    { name: 'Size', value: 'Large (15oz)', priceAdjustment: 20, quantity: 20 }
                ],
                tags: ['mug', 'coffee', 'ceramic', 'custom'],
                featured: true,
                status: 'active',
                inventory: {
                    trackQuantity: true,
                    quantity: 90,
                    lowStockThreshold: 15,
                    stockStatus: 'in-stock'
                },
                createdBy: adminId
            },

            // Phone Cases
            {
                name: 'iPhone 14 Protective Case',
                description: 'Durable protective case for iPhone 14. Provides excellent protection while maintaining easy access to all ports.',
                shortDescription: 'Protective case for iPhone 14',
                category: phoneCaseCategory._id,
                price: 200,
                sku: 'CASE-001',
                weight: 0.1,
                images: [
                    { url: '/images/products/case-iphone14-1.jpg', alt: 'iPhone 14 Case', isPrimary: true }
                ],
                variants: [
                    { name: 'Color', value: 'Clear', priceAdjustment: 0, quantity: 15 },
                    { name: 'Color', value: 'Black', priceAdjustment: 0, quantity: 20 },
                    { name: 'Color', value: 'Blue', priceAdjustment: 5, quantity: 10 }
                ],
                tags: ['phone case', 'iphone', 'protection'],
                status: 'active',
                inventory: {
                    trackQuantity: true,
                    quantity: 45,
                    lowStockThreshold: 10,
                    stockStatus: 'in-stock'
                },
                createdBy: adminId
            },

            // Keychains
            {
                name: 'Metal Keychain',
                description: 'Durable metal keychain that can be customized with your logo or design.',
                shortDescription: 'Custom metal keychain',
                category: keychainCategory._id,
                price: 75,
                sku: 'KEY-001',
                weight: 0.05,
                images: [
                    { url: '/images/products/keychain-metal-1.jpg', alt: 'Metal Keychain', isPrimary: true }
                ],
                variants: [
                    { name: 'Shape', value: 'Round', priceAdjustment: 0, quantity: 25 },
                    { name: 'Shape', value: 'Square', priceAdjustment: 0, quantity: 30 },
                    { name: 'Shape', value: 'Heart', priceAdjustment: 5, quantity: 15 }
                ],
                tags: ['keychain', 'metal', 'custom', 'accessories'],
                status: 'active',
                inventory: {
                    trackQuantity: true,
                    quantity: 70,
                    lowStockThreshold: 20,
                    stockStatus: 'in-stock'
                },
                createdBy: adminId
            },

            // Hoodies
            {
                name: 'Designer Hoodie',
                description: 'Premium quality hoodie with modern design. Perfect for casual wear and keeping warm.',
                shortDescription: 'Premium designer hoodie',
                category: hoodieCategory._id,
                price: 450,
                comparePrice: 500,
                sku: 'HOOD-001',
                weight: 0.8,
                images: [
                    { url: '/images/products/hoodie-designer-1.jpg', alt: 'Designer Hoodie', isPrimary: true },
                    { url: '/images/products/hoodie-designer-2.jpg', alt: 'Designer Hoodie Back' }
                ],
                variants: [
                    { name: 'Size', value: 'S', priceAdjustment: 0, quantity: 8 },
                    { name: 'Size', value: 'M', priceAdjustment: 0, quantity: 12 },
                    { name: 'Size', value: 'L', priceAdjustment: 0, quantity: 10 },
                    { name: 'Size', value: 'XL', priceAdjustment: 15, quantity: 5 }
                ],
                tags: ['hoodie', 'designer', 'premium', 'winter'],
                featured: true,
                status: 'active',
                inventory: {
                    trackQuantity: true,
                    quantity: 35,
                    lowStockThreshold: 10,
                    stockStatus: 'in-stock'
                },
                createdBy: adminId
            },

            // Low stock item for testing
            {
                name: 'Limited Edition Mug',
                description: 'Special limited edition mug with unique design. Only a few left in stock!',
                shortDescription: 'Limited edition ceramic mug',
                category: mugCategory._id,
                price: 180,
                comparePrice: 220,
                sku: 'MUG-LTD-001',
                weight: 0.4,
                images: [
                    { url: '/images/products/mug-limited-1.jpg', alt: 'Limited Edition Mug', isPrimary: true }
                ],
                variants: [
                    { name: 'Size', value: 'Medium (11oz)', priceAdjustment: 0, quantity: 3 }
                ],
                tags: ['mug', 'limited', 'special', 'collectible'],
                status: 'active',
                inventory: {
                    trackQuantity: true,
                    quantity: 3,
                    lowStockThreshold: 5,
                    stockStatus: 'low-stock'
                },
                createdBy: adminId
            }
        ];

        const createdProducts = await Product.insertMany(products);
        console.log(`${createdProducts.length} products created`);
        return createdProducts;
    } catch (error) {
        console.error('Error creating products:', error);
        return [];
    }
};

// Main seeding function
const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');

        await connectDB();

        // Clear existing data (optional - comment out if you want to keep existing data)
        // This line is commented out in your original code, which means it won't clear the DB
        // If you want to re-seed from scratch, uncomment it:
        // await clearDatabase();

        // Seed admin user
        const admin = await seedAdmin();

        // Check if admin was successfully created before proceeding
        if (!admin) {
            console.error("Admin user not created. Aborting seeding of dependent data.");
            return; // Exit if admin creation failed
        }

        // Seed sample users
        await seedUsers();

        // Seed categories
        // Ensure admin._id is valid before passing
        const categories = await seedCategories(admin._id);

        // Seed products
        // Ensure categories are valid before passing
        const products = await seedProducts(admin._id, categories);

        console.log('\n=== Database Seeding Complete ===');
        console.log(`Admin user: admin@fenkparet.com / Admin123!`);
        console.log(`Categories: ${categories.length}`);
        console.log(`Products: ${products.length}`);
        console.log(`Sample users: 3`); // This count is hardcoded, ensure seedUsers actually creates 3
        console.log('\nYou can now start the application!');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        // Ensure mongoose connection is closed even if errors occur
        if (mongoose.connection.readyState === 1) { // Check if connected
            await mongoose.connection.close();
            console.log('Database connection closed');
        } else {
            console.log('Database connection was already closed or never opened.');
        }
    }
};

// Run seeding if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = {
    seedDatabase,
    seedAdmin,
    seedUsers,
    seedCategories,
    seedProducts
};