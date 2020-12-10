'use strict';

const Set = sequelize.define('Set', {
    // Model attributes are defined here
    name: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.DECIMAL(10, 2)
    }
}, {
    // Other model options go here
});

console.log('Set', Set);