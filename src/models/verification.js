const verification = (sequelize, DataTypes) => {
  const Verification = sequelize.define("verification", {
    file_location_front: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: true,
      validate: { notEmpty: false },
    },
    file_location_back: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: true,
      validate: { notEmpty: false },
    },
  })

  Verification.associate = (models) => {
    Verification.belongsTo(models.User)
  }

  return Verification
}

export default verification
