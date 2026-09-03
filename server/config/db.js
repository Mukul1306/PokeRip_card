const mongoose = require("mongoose");

// =====================================================
// MONGODB CONNECTION
// =====================================================

const connectDB = async () => {
  try {

    // =================================================
    // CHECK MONGO_URI
    // =================================================

    if (!process.env.MONGO_URI) {

      throw new Error(
        "MONGO_URI is missing from .env"
      );
    }

    console.log(
      "Connecting to MongoDB..."
    );

    // =================================================
    // CONNECT
    // =================================================

    const connection =
      await mongoose.connect(
        process.env.MONGO_URI,
        {
          serverSelectionTimeoutMS: 15000,

          socketTimeoutMS: 45000,

          connectTimeoutMS: 15000,

          family: 4,
        }
      );

    // =================================================
    // SUCCESS
    // =================================================

    console.log(
      "MongoDB connected successfully"
    );

    console.log(
      `MongoDB host: ${connection.connection.host}`
    );

    console.log(
      `MongoDB database: ${connection.connection.name}`
    );

    return connection;

  } catch (error) {

    // =================================================
    // ERROR
    // =================================================

    console.error(
      "========================================"
    );

    console.error(
      "MongoDB connection failed"
    );

    console.error(
      "========================================"
    );

    console.error(
      "Error:",
      error.message
    );

    // =================================================
    // COMMON ERROR TYPES
    // =================================================

    if (
      error.message.includes(
        "ECONNRESET"
      )
    ) {

      console.error(
        "MongoDB connection was reset by the remote server."
      );

      console.error(
        "Check MongoDB Atlas network access and cluster status."
      );
    }

    if (
      error.message.includes(
        "ECONNREFUSED"
      )
    ) {

      console.error(
        "MongoDB refused the connection."
      );
    }

    if (
      error.message.includes(
        "authentication"
      )
    ) {

      console.error(
        "MongoDB username/password authentication failed."
      );
    }

    if (
      error.message.includes(
        "Server selection"
      )
    ) {

      console.error(
        "MongoDB server could not be selected."
      );

      console.error(
        "Check your MongoDB URI and network connection."
      );
    }

    console.error(
      "========================================"
    );

    // =================================================
    // IMPORTANT
    // =================================================

    throw error;
  }
};


// =====================================================
// MONGOOSE CONNECTION EVENTS
// =====================================================

mongoose.connection.on(
  "connected",
  () => {

    console.log(
      "Mongoose connection established."
    );

  }
);


mongoose.connection.on(
  "error",
  (error) => {

    console.error(
      "Mongoose connection error:",
      error.message
    );

  }
);


mongoose.connection.on(
  "disconnected",
  () => {

    console.error(
      "MongoDB disconnected."
    );

  }
);


mongoose.connection.on(
  "reconnected",
  () => {

    console.log(
      "MongoDB reconnected."
    );

  }
);


// =====================================================
// EXPORT
// =====================================================

module.exports =
  connectDB;