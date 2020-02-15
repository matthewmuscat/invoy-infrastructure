import bcrypt from 'bcrypt';

const verification = (sequelize, DataTypes) => {
  const Verification = sequelize.define('verification', {
    file_location: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
  });

  Verification.associate = models => {
    Verification.belongsTo(models.User);
  };

  return Verification;
};

export default verification;
