const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true
        },
        author: {
            type: String,
            trim: true
        },
        create_date: {
            type: Date,
            default: Date.now,
            required: true
        },
        event_date: {
            type: Date,
            default: Date.now,
            required: true
        },
        content: {
            type: String
        },
        photos: [
            {
                url: {
                    type: String,
                }
            }
        ],
        pdf: {
            type: String //relative path of pdf
        }
    },
    {
        timestamps: true
    }
);

eventSchema.methods.toJSON = function() {
    const event = this;
    const eventObject = event.toObject(); //deep copy the event to eventObject

    eventObject.create_date = eventObject.create_date
        .toISOString()
        .substr(0, 10);
    eventObject.event_date = eventObject.event_date.toISOString().substr(0, 10);

    return eventObject;
};

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
