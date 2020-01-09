const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema(
    {
        account: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// adminSchema.methods.toJSON = function() {
//     const admin = this;
//     const adminObject = admin.toObject(); //deep copy the admin to adminObject
//     return adminObject;
// };

adminSchema.methods.generateAuthToken = function() {
    const admin = this;
    const token = jwt.sign({ _id: admin._id }, process.env.SECRETE_TOKEN, {
        expiresIn: "1d"
    });

    return token;
};

adminSchema.statics.findByCredentials = async (account, password) => {
    const admin = await Admin.findOne({ account });

    if (!admin) {
        throw new Error("Invalid Account ID!");
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
        throw new Error("Invalid Password!");
    }

    return admin;
};

// has the plain text password before saving
adminSchema.pre("save", async function(next) {
    const admin = this;
    // console.log("just before save()!");
    if (admin.isModified("password")) {
        admin.password = await bcrypt.hash(admin.password, 8);
    }
    next();
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
