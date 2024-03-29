const { DataTypes, Model } = require('sequelize');
const sequelize = require('../database');

const Product = sequelize.define('products', {
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        // unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false
    },
    total_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    remaining_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    tagline: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    collection_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    refundable_deposit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    featuredImagePath: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    featuredImageName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    images: {
        type: DataTypes.TEXT, // Store as JSON string
        allowNull: true,
        defaultValue: null,
        get() {
            const rawValue = this.getDataValue('images');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('images', JSON.stringify(value));
        }
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    faqs : {
        type: DataTypes.TEXT,
        defaultValue: null
    }

}, {
    timestamps: true, // if you want to have Sequelize automatically add createdAt and updatedAt
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Product;