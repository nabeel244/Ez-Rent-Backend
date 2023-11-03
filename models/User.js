const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('user', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    // allowNull: false,
},
  phone: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  role: {
    type: DataTypes.ENUM,
    values: ['lessee', 'lessor']   //lessee mean user, and lessor mean vendor
    
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
