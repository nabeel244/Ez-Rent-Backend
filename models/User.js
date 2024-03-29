const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('users', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',

  },
  phone: {
    type: DataTypes.STRING
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verify_code: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
},
  role: {
    type: DataTypes.ENUM,
    defaultValue: 'lessee',
    values: ['lessee', 'lessor','admin']   //lessee mean user, and lessor mean vendor

  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
