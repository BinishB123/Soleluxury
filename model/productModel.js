const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    createdOn: {
        type: String,
        required: true
    },
    totalQuantity: {
        type: String, 
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    productImage: {
        type: Array,
        required: true
    },
    totalQuantity: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    size: {
        s: {
            quantity: {
                type: Number,
                required: true
            }
        },
        m: {
            quantity: {
                type: Number,
                required: true
            }
        },
        l: {
            quantity: {
                type: Number,
                required: true
            }
        }
    }
});

const product = mongoose.model("products", productSchema);
module.exports = product;
