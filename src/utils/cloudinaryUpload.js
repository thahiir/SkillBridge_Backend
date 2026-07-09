const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

exports.uploadImage = (buffer) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(

            {
                folder: "skillbridge/profile",

                transformation: [

                    {
                        width: 400,
                        height: 400,
                        crop: "fill",
                    },

                    {
                        quality: "auto",
                    },

                    {
                        fetch_format: "auto",
                    }

                ]

            },

            (error, result) => {

                if (error) return reject(error);

                resolve(result);

            }

        );

        streamifier
            .createReadStream(buffer)
            .pipe(stream);

    });

};